import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import type { Attempt } from './learning';

interface AdventurePlugin {
  readAttempts(): Promise<{ attempts: Attempt[] }>;
  addAttempt(attempt: Attempt): Promise<void>;
  speak(input: { text: string }): Promise<void>;
  listen(): Promise<{ transcript: string }>;
  cancelListen(): Promise<void>;
}

const native = registerPlugin<AdventurePlugin>('Adventure');
const isAndroid = Capacitor.getPlatform() === 'android';
const attemptsKey = 'english-adventure.attempts.v1';

export async function readAttempts(): Promise<Attempt[]> {
  if (isAndroid) return (await native.readAttempts()).attempts;
  const saved = localStorage.getItem(attemptsKey);
  return saved ? JSON.parse(saved) as Attempt[] : [];
}

export async function addAttempt(attempt: Attempt) {
  if (isAndroid) return native.addAttempt(attempt);
  const saved = localStorage.getItem(attemptsKey);
  const attempts: Attempt[] = saved ? JSON.parse(saved) : [];
  localStorage.setItem(attemptsKey, JSON.stringify([...attempts, attempt]));
}

let listening = false;

export async function speak(text: string) {
  if (listening) throw new Error('正在跟读，请结束录音后再朗读。');
  if (isAndroid) return native.speak({ text });
  if (!('speechSynthesis' in window)) throw new Error('当前浏览器不支持朗读。');
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  const voice = window.speechSynthesis;
  voice.cancel();
  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = ({ error }) => {
      if (error === 'canceled' || error === 'interrupted') resolve();
      else reject(new Error('朗读失败，请检查设备的英语朗读语音。'));
    };
    voice.speak(utterance);
  });
}

interface BrowserRecognition {
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

export async function listen(signal: AbortSignal) {
  signal.throwIfAborted();
  if (listening) throw new Error('正在识别，请稍候。');
  listening = true;
  try {
    return await listenWithPlatform(signal);
  } finally {
    listening = false;
  }
}

async function listenWithPlatform(signal: AbortSignal) {
  if (isAndroid) {
    const cancel = () => void native.cancelListen().catch(() => {});
    signal.addEventListener('abort', cancel, { once: true });
    try {
      return (await native.listen()).transcript;
    } finally {
      signal.removeEventListener('abort', cancel);
    }
  }
  const browser = window as Window & {
    SpeechRecognition?: new () => BrowserRecognition;
    webkitSpeechRecognition?: new () => BrowserRecognition;
  };
  const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  if (!Recognition) throw new Error('当前浏览器不支持语音识别。');
  window.speechSynthesis?.cancel();
  const recognition = new Recognition();
  const cancel = () => recognition.abort();
  signal.addEventListener('abort', cancel, { once: true });
  try {
    return await new Promise<string>((resolve, reject) => {
      recognition.lang = 'en-US';
      recognition.onresult = (event) => resolve(event.results[0][0].transcript);
      recognition.onerror = ({ error }) => reject(new Error(
        error === 'not-allowed' ? '请在浏览器设置中允许麦克风访问。' : '没有听清，请再试一次。',
      ));
      recognition.onend = () => reject(new Error('未识别到语音，请再试一次。'));
      recognition.start();
    });
  } finally {
    signal.removeEventListener('abort', cancel);
  }
}

export interface AiProvider {
  id: string;
  name: string;
  check(endpoint?: string): Promise<string>;
}

export const ollamaProvider: AiProvider = {
  id: 'windows-ollama',
  name: 'Windows Ollama',
  async check(endpoint = '') {
    const url = new URL(endpoint.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('请输入服务地址，例如 http://192.168.1.20:11434。');
    }
    const target = `${url.origin}/api/tags`;
    let data: { models?: unknown[] };
    if (isAndroid) {
      const response = await CapacitorHttp.get({
        url: target,
        connectTimeout: 4500,
        readTimeout: 4500,
        disableRedirects: true,
        responseType: 'json',
      });
      if (response.status !== 200) throw new Error(`连接失败（HTTP ${response.status}）。`);
      data = response.data;
    } else {
      const response = await fetch(target, { signal: AbortSignal.timeout(4500), redirect: 'error' });
      if (!response.ok) throw new Error(`连接失败（HTTP ${response.status}）。`);
      data = await response.json();
    }
    if (!Array.isArray(data?.models)) throw new Error('地址未返回 Ollama 模型列表。');
    return `已连接 · ${data.models.length} 个模型`;
  },
};

export const androidAiProvider: AiProvider = {
  id: 'android-local',
  name: 'Android 本地 AI',
  async check() {
    return '尚未启用';
  },
};
