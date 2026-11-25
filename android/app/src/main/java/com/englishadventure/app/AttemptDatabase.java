package com.englishadventure.app;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

final class AttemptDatabase extends SQLiteOpenHelper {
    AttemptDatabase(Context context) {
        super(context, "english_adventure.db", null, 2);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE attempts (" +
            "id INTEGER PRIMARY KEY, lesson_id TEXT NOT NULL, exercise_index INTEGER NOT NULL, " +
            "correct INTEGER NOT NULL, local_day TEXT NOT NULL, answered_at INTEGER)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            db.execSQL("ALTER TABLE attempts ADD COLUMN answered_at INTEGER");
        }
    }
}
