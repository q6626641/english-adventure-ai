package com.englishadventure.app;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

@CapacitorPlugin(name = "Adventure", permissions = {
    @Permission(alias = AdventurePlugin.MICROPHONE, strings = {Manifest.permission.RECORD_AUDIO})
})
public class AdventurePlugin extends Plugin {
    static final String MICROPHONE = "microphone";
    private static final String NO_SPEECH_SERVICE =
        "当前没有可用的英文语音识别服务。可以在系统设置中启用语音输入，或在下方手动输入。";
    private static final String MICROPHONE_REQUIRED =
        "请在系统设置中允许「英语奇遇」使用麦克风，然后重试。";
    private final Handler speechHandler = new Handler(Looper.getMainLooper());
    private PluginCall pendingListen;
    private SpeechRecognizer recognizer;
    private Runnable recognitionTimeout;

    private AttemptDatabase database;
    private TextToSpeech tts;
    private boolean ttsReady;

    @Override
    public void load() {
        database = new AttemptDatabase(getContext().getApplicationContext());
        getBridge().executeOnMainThread(() -> {
            tts = new TextToSpeech(getContext().getApplicationContext(), status -> {
                ttsReady = status == TextToSpeech.SUCCESS
                    && tts.setLanguage(Locale.US) >= TextToSpeech.LANG_AVAILABLE;
                if (ttsReady) tts.setSpeechRate(0.85f);
            });
        });
    }

    @PluginMethod
    public void readAttempts(PluginCall call) {
        try (Cursor cursor = database.getReadableDatabase().query("attempts",
                new String[]{"lesson_id", "exercise_index", "correct", "local_day", "answered_at"},
                null, null, null, null, "id ASC")) {
            JSArray attempts = new JSArray();
            while (cursor.moveToNext()) {
                JSObject attempt = new JSObject();
                attempt.put("lessonId", cursor.getString(0));
                attempt.put("exerciseIndex", cursor.getInt(1));
                attempt.put("correct", cursor.getInt(2) == 1);
                attempt.put("day", cursor.getString(3));
                if (!cursor.isNull(4)) attempt.put("at", cursor.getLong(4));
                attempts.put(attempt);
            }
            JSObject result = new JSObject();
            result.put("attempts", attempts);
            call.resolve(result);
        } catch (SQLException error) {
            call.reject("无法读取学习进度。", error);
        }
    }

    @PluginMethod
    public void addAttempt(PluginCall call) {
        String lessonId = call.getString("lessonId");
        Integer index = call.getInt("exerciseIndex");
        Boolean correct = call.getBoolean("correct");
        String day = call.getString("day");
        Long answeredAt = call.getLong("at");
        if (lessonId == null || lessonId.isEmpty() || index == null || index < 0 || correct == null
                || day == null || !day.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}")) {
            call.reject("练习记录无效。");
            return;
        }
        ContentValues values = new ContentValues();
        values.put("lesson_id", lessonId);
        values.put("exercise_index", index);
        values.put("correct", correct ? 1 : 0);
        values.put("local_day", day);
        values.put("answered_at", answeredAt);
        try {
            database.getWritableDatabase().insertOrThrow("attempts", null, values);
            call.resolve();
        } catch (SQLException error) {
            call.reject("无法保存练习结果。", error);
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        getBridge().executeOnMainThread(() -> {
            if (!ttsReady || tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, UUID.randomUUID().toString()) != TextToSpeech.SUCCESS) {
                call.reject("朗读不可用，请在手机设置中检查英语语音包。");
                return;
            }
            call.resolve();
        });
    }


    @PluginMethod
    public void listen(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            if (pendingListen != null) {
                call.reject("正在识别，请稍候。");
                return;
            }
            pendingListen = call;
            if (tts != null) tts.stop();
            if (!supportsOnDeviceSpeech() && !SpeechRecognizer.isRecognitionAvailable(getContext())) {
                openSystemSpeech(call);
            } else if (getPermissionState(MICROPHONE) == PermissionState.GRANTED) {
                startSpeech(call, supportsOnDeviceSpeech());
            } else {
                requestPermissionForAlias(MICROPHONE, call, "onMicrophonePermission");
            }
        });
    }

    @PermissionCallback
    private void onMicrophonePermission(PluginCall call) {
        if (call != pendingListen) return;
        if (getPermissionState(MICROPHONE) == PermissionState.GRANTED) {
            startSpeech(call, supportsOnDeviceSpeech());
        } else {
            failSpeech(call, MICROPHONE_REQUIRED);
        }
    }

    @PluginMethod
    public void cancelListen(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            if (pendingListen != null) failSpeech(pendingListen, "已取消跟读。");
            call.resolve();
        });
    }

    private boolean supportsOnDeviceSpeech() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
            && SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext());
    }

    private void startSpeech(PluginCall call, boolean onDevice) {
        try {
            SpeechRecognizer current;
            if (onDevice && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                current = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
            } else {
                current = SpeechRecognizer.createSpeechRecognizer(getContext());
            }
            recognizer = current;
            current.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onResults(Bundle results) {
                    if (recognizer != current) return;
                    completeSpeech(call, results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION));
                }

                @Override
                public void onError(int error) {
                    if (recognizer != current) return;
                    switch (error) {
                        case SpeechRecognizer.ERROR_CLIENT:
                        case SpeechRecognizer.ERROR_SERVER_DISCONNECTED:
                        case SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED:
                        case SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE:
                            tryAnotherSpeechService(call, onDevice);
                            break;
                        case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                        case SpeechRecognizer.ERROR_AUDIO:
                            failSpeech(call, "无法使用麦克风。请检查麦克风权限或系统麦克风开关。");
                            break;
                        case SpeechRecognizer.ERROR_NETWORK:
                        case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                            failSpeech(call, "语音识别连接失败。请检查网络后重试，或手动输入。");
                            break;
                        default:
                            failSpeech(call, "没有听清，请再试一次，或手动输入。");
                    }
                }

                @Override public void onReadyForSpeech(Bundle params) {}
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float rmsdB) {}
                @Override public void onBufferReceived(byte[] buffer) {}
                @Override public void onEndOfSpeech() {}
                @Override public void onPartialResults(Bundle partialResults) {}
                @Override public void onEvent(int eventType, Bundle params) {}
            });
            recognitionTimeout = () -> failSpeech(call, "语音识别超时，请再试一次，或手动输入。");
            speechHandler.postDelayed(recognitionTimeout, 20_000);
            current.startListening(recognitionIntent(onDevice));
        } catch (UnsupportedOperationException | IllegalArgumentException | IllegalStateException error) {
            tryAnotherSpeechService(call, onDevice);
        } catch (SecurityException error) {
            failSpeech(call, MICROPHONE_REQUIRED);
        }
    }

    private void tryAnotherSpeechService(PluginCall call, boolean wasOnDevice) {
        releaseRecognizer();
        if (wasOnDevice && SpeechRecognizer.isRecognitionAvailable(getContext())) {
            startSpeech(call, false);
        } else {
            openSystemSpeech(call);
        }
    }

    private static Intent recognitionIntent(boolean preferOffline) {
        return new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
            .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, preferOffline)
            .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
    }

    private void openSystemSpeech(PluginCall call) {
        try {
            startActivityForResult(call, recognitionIntent(true), "onRecognition");
        } catch (ActivityNotFoundException | SecurityException error) {
            failSpeech(call, NO_SPEECH_SERVICE);
        }
    }

    @ActivityCallback
    private void onRecognition(PluginCall call, ActivityResult result) {
        if (call == null || pendingListen != call) return;
        Intent data = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || data == null) {
            failSpeech(call, "没有收到语音识别结果，可以重试或输入英文。");
            return;
        }
        completeSpeech(call, data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS));
    }

    private void completeSpeech(PluginCall call, ArrayList<String> transcripts) {
        if (transcripts == null || transcripts.isEmpty() || transcripts.get(0).trim().isEmpty()) {
            failSpeech(call, "没有识别到英文，请再试一次。");
            return;
        }
        pendingListen = null;
        releaseRecognizer();
        JSObject response = new JSObject();
        response.put("transcript", transcripts.get(0));
        call.resolve(response);
    }

    private void failSpeech(PluginCall call, String message) {
        if (pendingListen != call) return;
        pendingListen = null;
        releaseRecognizer();
        call.reject(message);
    }

    private void releaseRecognizer() {
        if (recognitionTimeout != null) {
            speechHandler.removeCallbacks(recognitionTimeout);
            recognitionTimeout = null;
        }
        if (recognizer != null) {
            SpeechRecognizer previous = recognizer;
            recognizer = null;
            previous.destroy();
        }
    }

    @Override
    protected void handleOnStop() {
        // A permission prompt or the external speech activity can temporarily leave this screen.
        if (recognizer != null && pendingListen != null) failSpeech(pendingListen, "跟读已停止，请重试。");
    }

    @Override
    protected void handleOnDestroy() {
        if (pendingListen != null) failSpeech(pendingListen, "已取消跟读。");
        getBridge().execute(database::close);
        if (tts != null) {
            ttsReady = false;
            tts.shutdown();
        }
    }
}
