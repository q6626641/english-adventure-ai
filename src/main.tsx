import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, MotionConfig, domAnimation, m } from 'motion/react';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight,
  CircleAlert, Compass, Flag, Headphones, Keyboard, Mic, NotebookPen, Settings,
  Sparkles, Trophy, Volume2, X,
} from 'lucide-react';
import { lessons, translatePracticeText, type Lesson, type Exercise } from './lessons';
import { exerciseKey, localDay, nextLessonToPractice, normalizeAnswer, remainingExercises, summarize, type Attempt } from './learning';
import { addAttempt, androidAiProvider, listen, ollamaProvider, readAttempts } from './platform';
import { PronounceText, ReadAloud, usePronunciation } from './pronunciation';
import { AdventureMap, HeroArt, RewardArt, art } from './map';
import { adventureRewards, completedWorlds, worlds } from './worlds';
import { reviewSchedule } from './review';
import { readPreference, savePreference } from './preferences';
import './styles.css';

type Screen = 'learn' | 'review' | 'progress' | 'settings';
type Question = { lesson: Lesson; index: number };
type Session = { queue: Question[]; position: number; correct: number; coinsAtStart: number; chestsAtStart: number };
const screens = [
  { id: 'learn', label: '地图', icon: Compass },
  { id: 'review', label: '复习', icon: NotebookPen },
  { id: 'progress', label: '成就', icon: Trophy },
  { id: 'settings', label: '设置', icon: Settings },
] as const;
const categories = ['全部', '日常口语', '外贸英语', '英语语法', '综合实战'] as const;
const types = {
  choice: { label: '选择题', icon: BookOpen },
  listen: { label: '听力练习', icon: Headphones },
  spell: { label: '单词拼写', icon: Keyboard },
  speak: { label: '英文跟读', icon: Mic },
};
const translationPreferenceKey = 'show-practice-translation';
const formatError = (error: unknown) => error instanceof Error ? error.message : String(error);

function App() {
  const [screen, setScreen] = useState<Screen>('learn');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [category, setCategory] = useState<Lesson['category'] | '全部'>('全部');
  const [preview, setPreview] = useState<Lesson>();
  const [session, setSession] = useState<Session>();
  const [answer, setAnswer] = useState('');
  const [showTranslation, setShowTranslation] = useState(() => readPreference(translationPreferenceKey, false));
  const [animations, setAnimations] = useState(() => readPreference('animations', true));
  const [effects, setEffects] = useState(() => readPreference('sound-effects', false));
  const [now, setNow] = useState(Date.now);
  const [correctFeedback, setCorrectFeedback] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveInFlight = useRef(false);
  const [result, setResult] = useState<{ correct: number; total: number; coinsAtStart: number; chestsAtStart: number }>();
  const { mastered, mistakes } = useMemo(() => summarize(attempts), [attempts]);
  const remaining = useMemo(() => new Map(lessons.map((lesson) => [lesson.id, remainingExercises(lesson, mastered)])), [mastered]);
  const completed = new Set(lessons.filter(({ id }) => remaining.get(id)?.length === 0).map(({ id }) => id));
  const rewards = adventureRewards(lessons.reduce((total, lesson) => total + lesson.exercises.length - (remaining.get(lesson.id)?.length ?? 0), 0), completed);
  const route = useMemo(() => worlds.flatMap((world) => world.lessons.map((id) => lessons.find((lesson) => lesson.id === id)!)), []);
  const nextLesson = nextLessonToPractice(route, attempts, remaining);
  const previewRemaining = preview ? remaining.get(preview.id) ?? [] : [];
  const hasPartialProgress = preview && previewRemaining.length > 0 && previewRemaining.length < preview.exercises.length;
  const visibleLessons = lessons.filter((lesson) => category === '全部' || lesson.category === category);
  const visibleCompleted = visibleLessons.filter(({ id }) => completed.has(id)).length;
  const today = attempts.filter((attempt) => attempt.day === localDay(new Date(now))).length;
  const schedule = useMemo(() => reviewSchedule(attempts, lessons), [attempts]);
  const due = schedule.filter(({ card }) => +card.due <= now);
  const question = session?.queue[session.position];
  const exercise = question?.lesson.exercises[question.index];
  const treasure = Boolean(result && rewards.chests > result.chestsAtStart);

  function loadProgress() {
    setReady(false);
    setStorageError('');
    readAttempts().then((items) => {
      setAttempts(items);
      setReady(true);
    }).catch(() => setStorageError('暂时无法读取学习进度。'));
  }

  useEffect(loadProgress, []);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, preview, session, result]);

  function updateTranslationPreference(checked: boolean) {
    setShowTranslation(checked);
    savePreference(translationPreferenceKey, checked);
  }

  function clearActivity() {
    setPreview(undefined);
    setSession(undefined);
    setResult(undefined);
    setAnswer('');
    setShowCorrection(false);
    setCorrectFeedback(0);
    pagePronunciation.setError('');
  }

  function startSession(queue: Question[]) {
    if (!queue.length) return;
    clearActivity();
    setSession({ queue, position: 0, correct: 0, coinsAtStart: rewards.coins, chestsAtStart: rewards.chests });
  }

  function start(lesson: Lesson, indices = lesson.exercises.map((_, index) => index)) {
    startSession(indices.map((index) => ({ lesson, index })));
  }

  async function submit() {
    if (!session || !question || !exercise || !ready || saveInFlight.current || showCorrection || !answer.trim()) return;
    const correct = normalizeAnswer(answer) === normalizeAnswer(exercise.answer);
    const date = new Date();
    const attempt = { lessonId: question.lesson.id, exerciseIndex: question.index, correct, day: localDay(date), at: +date };
    setStorageError('');
    saveInFlight.current = true;
    setSaving(true);
    try {
      await addAttempt(attempt);
      setAttempts((current) => [...current, attempt]);
      setNow(Date.now());
      if (correct) {
        const final = session.position + 1 === session.queue.length;
        if (effects) {
          const sound = new Audio(art(final ? 'reward.ogg' : 'correct.ogg'));
          sound.volume = .35;
          void sound.play().catch(() => {});
        }
        setCorrectFeedback((value) => value + 1);
        advance(true);
      }
      else {
        setCorrectFeedback(0);
        setShowCorrection(true);
      }
    } catch {
      setStorageError('这道题的结果没有保存。请再次提交。');
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  function advance(wasCorrect: boolean) {
    if (!session) return;
    const correct = session.correct + Number(wasCorrect);
    if (session.position + 1 === session.queue.length) {
      setResult({ correct, total: session.queue.length, coinsAtStart: session.coinsAtStart, chestsAtStart: session.chestsAtStart });
      setSession(undefined);
    } else {
      setSession({ ...session, correct, position: session.position + 1 });
    }
    setAnswer('');
    setShowCorrection(false);
  }

  const pagePronunciation = usePronunciation();
  const hasActivity = Boolean(preview || session || result);
  const back = () => {
    clearActivity();
    if (question && screen === 'learn') setPreview(question.lesson);
  };

  return (
    <MotionConfig reducedMotion={animations ? 'user' : 'always'}>
    <div className="app" data-animations={animations}>
      <header className="header">
        <div className="header-inner">
          <button className="brand" onClick={() => { clearActivity(); setScreen('learn'); }} disabled={saving}>
            <span className="brand-icon"><Compass size={24} /></span>
            <span>英语奇遇<small>ENGLISH ADVENTURE</small></span>
          </button>
          <span className="today"><Flag size={16} /> 今日 {today} 题</span>
        </div>
        <ReadAloud />
      </header>

      <main className="content">
        {hasActivity && <button className="text-button back" onClick={back} disabled={saving}><ArrowLeft size={18} /> 返回</button>}
        {storageError && <div className="notice" role="alert"><CircleAlert size={20} /> {storageError}{!ready && <button className="text-button" onClick={loadProgress}>重试</button>}</div>}

        {result ? (
          <section className="panel result" aria-live="polite">
            <RewardArt perfect={result.correct === result.total} treasure={treasure} animations={animations} />
            <h1>{treasure ? '找到区域宝箱！' : result.correct === result.total ? '全对！' : '练习完成'}</h1>
            <p>答对 <strong>{result.correct} / {result.total}</strong> 题</p>
            {rewards.coins > result.coinsAtStart && <p className="coin-award"><img src={art('coin.png')} alt="" /> +{rewards.coins - result.coinsAtStart} 金币</p>}
            <button className="primary" onClick={clearActivity}>返回{screen === 'review' ? '复习页' : '冒险地图'} <ArrowRight size={18} /></button>
          </section>
        ) : session && question && exercise ? (
          <Practice key={exerciseKey(question.lesson.id, question.index)} session={session} exercise={exercise}
            correctFeedback={correctFeedback > 0 && !showCorrection} lessonTitle={question.lesson.title}
            answer={answer} setAnswer={setAnswer} showCorrection={showCorrection} saving={saving} submit={submit} advance={() => advance(false)}
            retry={() => { setAnswer(''); setShowCorrection(false); setCorrectFeedback(0); }}
            showTranslation={showTranslation} setShowTranslation={updateTranslationPreference} />
        ) : preview ? (
          <section className="panel lesson-detail">
            <span className="category-label">{preview.category}</span>
            <h1><PronounceText text={preview.title} play={pagePronunciation.play} /></h1>
            <p><PronounceText text={preview.description} play={pagePronunciation.play} /></p>
            <p className="lesson-progress">已掌握 {preview.exercises.length - previewRemaining.length} / {preview.exercises.length} 题</p>
            <h2>先学这几句</h2>
            <TranslationToggle checked={showTranslation} onChange={updateTranslationPreference} />
            <PhraseList phrases={preview.phrases} showTranslation={showTranslation} play={pagePronunciation.play} />
            {pagePronunciation.error && <p className="error" role="alert">{pagePronunciation.error}</p>}
            <div className="lesson-actions">
              <button className="primary" disabled={!ready} onClick={() => start(preview, hasPartialProgress ? previewRemaining : undefined)}>
                {hasPartialProgress ? '继续练习' : previewRemaining.length === 0 ? '复习整课' : '开始练习'} <ArrowRight size={18} />
              </button>
              {hasPartialProgress && <button className="secondary-button" disabled={!ready} onClick={() => start(preview)}>重练整课</button>}
            </div>
          </section>
        ) : screen === 'learn' ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="hero-kicker"><Compass size={17} /> 英语冒险地图</div>
                <h1>下一站，<br />用英语探险</h1>
                <p>{nextLesson ? '下一关 · ' + nextLesson.title : '所有关卡已通关，可以返回地图重练。'}</p>
                <button className="primary hero-button" disabled={!ready} onClick={() => setPreview(nextLesson ?? lessons[0])}>
                  {!nextLesson ? '复习课程' : attempts.length ? '继续学习' : '开始学习'} <ArrowRight size={18} />
                </button>
              </div>
              <HeroArt />
            </section>
            <div className="adventure-stats">
              <button onClick={() => setScreen('progress')}><Trophy size={21} /><span>等级 <strong>{rewards.level}</strong></span></button>
              <button onClick={() => setScreen('progress')}><img src={art('coin.png')} alt="" /><span>金币 <strong>{rewards.coins}</strong></span></button>
              <button onClick={() => { setNow(Date.now()); setScreen('review'); }}><NotebookPen size={21} /><span>待复习 <strong>{due.length}</strong></span></button>
            </div>
            <section className="route">
              <div className="section-head">
                <div><h2>选择探险区域</h2><p>可以自由探索，也可以沿路线逐关挑战。</p></div>
                <span className="count"><Trophy size={17} /> {visibleCompleted} / {visibleLessons.length} 关</span>
              </div>
              <div className="filters" aria-label="课程分类">
                {categories.map((item) => (
                  <button key={item} aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>
                ))}
              </div>
              <AdventureMap lessons={lessons} category={category} remaining={remaining} activeId={nextLesson?.id}
                onOpen={(lesson) => { clearActivity(); setPreview(lesson); }} />
            </section>
          </>
        ) : screen === 'review' ? (
          <section className="route secondary">
            <div className="section-head"><div><h1>复习营地</h1><p>练习到期的题，巩固记忆。</p></div></div>
            <div className="panel due-panel">
              <div><h2>智能复习 · {due.length} 道到期</h2><p>{due.length
                ? '按到期时间复习，答题结果会更新下次时间。'
                : schedule.length ? '下次复习 ' + schedule[0].card.due.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '完成任意一题后，这里会显示复习安排。'}</p></div>
              <button className="primary" disabled={!ready || !due.length} onClick={() => startSession(due.slice(0, 12))}>
                开始复习 <ArrowRight size={17} />
              </button>
            </div>
            <div className="section-head"><div><h2>错题本</h2><p>随时重练最近答错的题，答对后会自动移出。</p></div><span className="count">{mistakes.length} 道</span></div>
            {!mistakes.length && <div className="panel empty"><NotebookPen size={32} /><h2>暂无错题</h2><button className="text-button" onClick={() => setScreen('learn')}>去学习 <ArrowRight size={17} /></button></div>}
            {pagePronunciation.error && <p className="error review-audio-error" role="alert">{pagePronunciation.error}</p>}
            <div className="lesson-grid">
              {mistakes.map((attempt) => {
                const lesson = lessons.find(({ id }) => id === attempt.lessonId);
                const item = lesson?.exercises[attempt.exerciseIndex];
                if (!lesson || !item) return null;
                const Icon = types[item.kind].icon;
                return (
                  <div className="lesson-card review-card" key={exerciseKey(lesson.id, attempt.exerciseIndex)}>
                    <button className="review-open" type="button" aria-label={`重练：${item.prompt}`} disabled={!ready}
                      onClick={() => start(lesson, [attempt.exerciseIndex])}>
                      <span className="lesson-icon"><Icon size={23} /></span>
                    </button>
                    <span className="lesson-copy"><small>{lesson.title} · {types[item.kind].label}</small>
                      <strong><PronounceText text={item.prompt} play={pagePronunciation.play} /></strong>
                    </span>
                    <ChevronRight className="card-arrow" size={20} />
                  </div>
                );
              })}
            </div>
          </section>
        ) : screen === 'progress' ? (
          <section className="secondary settings">
            <div className="section-head"><div><h1>我的成就</h1><p>首次掌握题目、通关与区域宝箱会计入成长记录。</p></div></div>
            <div className="panel achievement-summary">
              <h2>探险家 Lv. {rewards.level}</h2>
              <progress aria-label="距离下一级的经验" value={rewards.xp % 100} max={100} />
              <p>{rewards.xp} 总经验 · {rewards.coins} 金币 · {completed.size}/{lessons.length} 关</p>
            </div>
            <div className="panel achievements">
              <h2>区域勋章 · {rewards.chests}/{worlds.length}</h2>
              {rewards.chests ? <ul>{completedWorlds(completed).map((world) => (
                <li key={world.id}><img src={art('star.png')} alt="" />{world.name}</li>
              ))}</ul> : <p>完成一个区域的全部课程即可获得勋章。</p>}
            </div>
          </section>
        ) : <AiSettings animations={animations} effects={effects}
          updateAnimations={(value) => { setAnimations(value); savePreference('animations', value); }}
          updateEffects={(value) => { setEffects(value); savePreference('sound-effects', value); }} />}

      </main>
      <footer className="bottom">
        <nav aria-label="主导航">
          {screens.map(({ id, label, icon: Icon }) => (
            <button key={id} aria-current={screen === id ? 'page' : undefined} disabled={saving}
              onClick={() => { clearActivity(); setNow(Date.now()); setScreen(id); }}>
              <Icon size={21} /><span>{label}</span>
            </button>
          ))}
        </nav>
      </footer>
    </div>
    </MotionConfig>
  );
}

function TranslationToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="translation-toggle">
      显示中文翻译
      <input type="checkbox" role="switch" checked={checked}
        onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function PhraseList({ phrases, showTranslation, play }: {
  phrases: Lesson['phrases']; showTranslation: boolean; play: (text: string) => void;
}) {
  return (
    <ul className="phrases">
      {phrases.map(([english, chinese]) => (
        <li key={english}>
          <span><strong lang="en"><PronounceText text={english} play={play} /></strong>
            {showTranslation && <small className="translation">{chinese}</small>}
          </span>
          <button type="button" className="icon-button" aria-label={`朗读整句 ${english}`} onClick={() => play(english)}>
            <Volume2 size={20} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Practice({ session, exercise, answer, setAnswer, showCorrection, correctFeedback, lessonTitle,
  saving, submit, advance, retry, showTranslation, setShowTranslation }: {
  session: Session;
  exercise: Exercise;
  answer: string;
  setAnswer: (text: string) => void;
  showCorrection: boolean;
  correctFeedback: boolean;
  lessonTitle: string;
  saving: boolean;
  submit: () => Promise<void>;
  advance: () => void;
  retry: () => void;
  showTranslation: boolean;
  setShowTranslation: (checked: boolean) => void;
}) {
  const { error, setError, play } = usePronunciation();
  const [recording, setRecording] = useState(false);
  const recognition = useRef<AbortController | null>(null);
  useEffect(() => () => recognition.current?.abort(), []);
  const [options] = useState(() => {
    if (!('options' in exercise)) return [];
    const shuffled = [...exercise.options];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    return shuffled;
  });
  const Icon = types[exercise.kind].icon;
  const translation = (text: string) => {
    const chinese = showTranslation && translatePracticeText(text);
    return chinese ? <small className="translation">{chinese}</small> : null;
  };
  const audio = exercise.kind === 'speak' ? exercise.answer : 'audio' in exercise ? exercise.audio : undefined;

  async function recognize() {
    if (recognition.current) return;
    const controller = new AbortController();
    recognition.current = controller;
    setError('');
    setRecording(true);
    try {
      const transcript = await listen(controller.signal);
      if (!controller.signal.aborted) setAnswer(transcript);
    } catch (issue) {
      if (!controller.signal.aborted) setError(formatError(issue));
    } finally {
      recognition.current = null;
      if (!controller.signal.aborted) setRecording(false);
    }
  }

  return (
    <section className="panel practice">
      <div className="practice-course">{lessonTitle}</div>
      <div className="practice-meta"><span className="category-label"><Icon size={17} /> {types[exercise.kind].label}</span><span>{session.position + 1} / {session.queue.length}</span></div>
      <progress aria-label="练习进度" value={session.position + 1} max={session.queue.length} />
      {correctFeedback && <div role="status" className="answer-success"><Check size={16} /> 上一题答对了</div>}
      <TranslationToggle checked={showTranslation} onChange={setShowTranslation} />
      <h1><PronounceText text={exercise.prompt} play={play} disabled={recording} /></h1>
      {translation(exercise.prompt)}
      {exercise.kind === 'speak' && <div className="spoken-example">
        <p className="spoken" lang="en"><PronounceText text={exercise.answer} play={play} disabled={recording} /></p>
        {translation(exercise.answer)}
      </div>}
      {audio && <button className="secondary-button" disabled={recording} onClick={() => play(audio)}><Volume2 size={19} /> 播放英文</button>}
      {exercise.kind === 'speak' && (recording
        ? <button className="secondary-button" onClick={() => { recognition.current?.abort(); setRecording(false); }}><Mic size={19} /> 停止跟读</button>
        : <button className="secondary-button" disabled={saving || showCorrection} onClick={recognize}><Mic size={19} /> 开始跟读</button>)}
      {error && <p className="error" role="alert">{error}</p>}
      <form onSubmit={(event) => { event.preventDefault(); if (!recording && !showCorrection) void submit(); }}>
        {options.length > 0 ? (
          <div className="options">
            <p className="options-hint">点圆圈选答案，点单词听发音。</p>
            {options.map((item) => (
              <div key={item} className="option" data-selected={item === answer} data-correct={showCorrection && item === exercise.answer}>
                <button type="button" className="option-pick" lang="en" aria-label={item} aria-pressed={item === answer}
                  disabled={saving || showCorrection} onClick={() => setAnswer(item)} />
                <span><span lang="en"><PronounceText text={item} play={play} /></span>{translation(item)}</span>
              </div>
            ))}
          </div>
        ) : (
          <label className="answer-label">
            {exercise.kind === 'speak' ? '识别结果（也可手动输入）' : '你的答案'}
            <input lang="en" value={answer} autoComplete="off" autoCapitalize="none" spellCheck={false}
              disabled={showCorrection || saving || recording} onChange={(event) => setAnswer(event.target.value)} placeholder="输入英文" />
          </label>
        )}
        {showCorrection && <m.div role="status" className="feedback wrong"
          initial={{ scale: .98 }} animate={{ scale: 1 }} transition={{ duration: .16 }}>
          <X size={19} />
          <span>参考答案 <strong lang="en"><PronounceText text={exercise.answer} play={play} /></strong>{translation(exercise.answer)}</span>
        </m.div>}
        {showCorrection ? (
          <div className="lesson-actions">
            <button className="primary" type="button" onClick={advance}>{session.position + 1 === session.queue.length ? '查看结果' : '下一题'} <ArrowRight size={18} /></button>
            <button className="secondary-button" type="button" onClick={retry}>再试一次</button>
          </div>
        ) : (
          <button className="primary" type="submit" disabled={saving || recording || !answer.trim()}>{saving ? '正在保存…' : '提交答案'} <ArrowRight size={18} /></button>
        )}
      </form>
    </section>
  );
}

const endpointKey = 'english-adventure.ollama-endpoint';

function AiSettings({ animations, effects, updateAnimations, updateEffects }: {
  animations: boolean; effects: boolean;
  updateAnimations: (value: boolean) => void; updateEffects: (value: boolean) => void;
}) {
  const [endpoint, setEndpoint] = useState(() => localStorage.getItem(endpointKey) ?? '');
  const [status, setStatus] = useState('');
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  async function check() {
    setChecking(true);
    setFailed(false);
    setStatus('');
    try {
      localStorage.setItem(endpointKey, endpoint.trim());
      setStatus(await ollamaProvider.check(endpoint));
    } catch (issue) {
      setFailed(true);
      setStatus(issue instanceof TypeError ? '连接失败。请检查服务地址和网络。' : formatError(issue));
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="secondary settings">
      <div className="section-head"><div><h1>设置</h1></div></div>
      <div className="panel settings-panel">
        <h2>练习体验</h2>
        <label className="translation-toggle">界面动画<input type="checkbox" role="switch" checked={animations}
          onChange={(event) => updateAnimations(event.target.checked)} /></label>
        <label className="translation-toggle">答题与奖励音效<input type="checkbox" role="switch" checked={effects}
          onChange={(event) => updateEffects(event.target.checked)} /></label>
      </div>
      <div className="panel settings-panel">
        <span className="lesson-icon"><Settings size={22} /></span>
        <h2>{ollamaProvider.name}</h2>
        <p>填入电脑上的 Ollama 服务地址，检测连通性和模型数量。</p>
        <form onSubmit={(event) => { event.preventDefault(); void check(); }}>
          <label className="answer-label">服务地址
            <input required inputMode="url" type="url" placeholder="http://192.168.1.20:11434" value={endpoint}
              onChange={(event) => { setEndpoint(event.target.value); setStatus(''); }} disabled={checking} />
          </label>
          <button className="primary" disabled={checking || !endpoint.trim()}>{checking ? '正在检测…' : '保存并检测'} <ArrowRight size={18} /></button>
          {status && <p role="status" className={failed ? 'error' : 'success'}>{status}</p>}
        </form>
      </div>
      <div className="panel settings-panel android-ai">
        <span className="lesson-icon"><Sparkles size={22} /></span>
        <div><h2>{androidAiProvider.name}</h2><p>尚未启用</p></div>
      </div>
    </section>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('App root missing');
createRoot(root).render(<StrictMode><LazyMotion features={domAnimation} strict><App /></LazyMotion></StrictMode>);
