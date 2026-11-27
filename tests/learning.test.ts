import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { lessons, translatePracticeText } from '../src/lessons.ts';
import { localDay, nextLessonToPractice, normalizeAnswer, remainingExercises, summarize } from '../src/learning.ts';
import { reviewSchedule } from '../src/review.ts';
import { adventureRewards, worlds } from '../src/worlds.ts';

test('accepts case, punctuation, full-width characters and extra spaces in speech', () => {
  assert.equal(normalizeAnswer('Ｔｏ go,  please!'), 'to go please');
  assert.equal(normalizeAnswer('I’m ready.'), 'im ready');
});

test('attempts retain mastery while mistakes track the latest result per exercise', () => {
  const wrong = { lessonId: 'coffee', exerciseIndex: 0, correct: false, day: '2026-11-23' };
  const right = { ...wrong, correct: true };
  const secondWrong = { ...wrong, exerciseIndex: 1 };
  const summary = summarize([wrong, wrong, right, secondWrong]);
  assert.deepEqual([...summary.mastered], ['coffee:0']);
  assert.deepEqual(summary.mistakes, [secondWrong]);
  assert.deepEqual(summarize([right, wrong]).mistakes, [wrong]);
});

test('daily progress uses the device calendar date', () => {
  assert.equal(localDay(new Date(2026, 10, 23, 23, 59)), '2026-11-23');
});

test('each lesson has a unique ID and valid exercises for all four practice modes', () => {
  assert.equal(new Set(lessons.map(({ id }) => id)).size, lessons.length);
  for (const { exercises } of lessons) {
    assert.deepEqual(new Set(exercises.map(({ kind }) => kind)), new Set(['choice', 'listen', 'spell', 'speak']));
    for (const exercise of exercises) {
      assert.ok(normalizeAnswer(exercise.answer));
      assert.ok(translatePracticeText(exercise.answer), exercise.answer);
      if (exercise.prompt.includes('___')) assert.ok(translatePracticeText(exercise.prompt), exercise.prompt);
      if ('options' in exercise) {
        assert.equal(new Set(exercise.options).size, exercise.options.length);
        assert.ok(exercise.options.includes(exercise.answer));
        for (const option of exercise.options) assert.ok(translatePracticeText(option), option);
      }
      if (exercise.kind === 'listen' && 'audio' in exercise) assert.ok(exercise.audio);
    }
  }
});

test('resuming prefers a recently practiced unfinished lesson and keeps previously mastered exercises', () => {
  const attempts = [
    { lessonId: 'coffee', exerciseIndex: 0, correct: true, day: '2026-11-22' },
    { lessonId: 'shipping', exerciseIndex: 2, correct: true, day: '2026-11-23' },
    { lessonId: 'retired', exerciseIndex: 0, correct: false, day: '2026-11-23' },
  ];
  const { mastered } = summarize(attempts);
  const remaining = new Map(lessons.map((lesson) => [lesson.id, remainingExercises(lesson, mastered)]));
  assert.deepEqual(remaining.get('coffee'), [1, 2, 3]);
  assert.deepEqual(remaining.get('shipping'), [0, 1, 3]);
  assert.equal(nextLessonToPractice(lessons, attempts, remaining)?.id, 'shipping');
  remaining.set('shipping', []);
  assert.equal(nextLessonToPractice(lessons, attempts, remaining)?.id, 'coffee');
  assert.equal(nextLessonToPractice(lessons, attempts, new Map())?.id, undefined);
});

test('all 35 distinct lessons appear once on their matching map route', () => {
  const ids = worlds.flatMap(({ lessons: entries }) => [...entries]);
  assert.equal(lessons.length, 35);
  assert.equal(new Set(lessons.map(({ title }) => title)).size, 35);
  assert.equal(ids.length, new Set(ids).size);
  assert.deepEqual(new Set(ids), new Set(lessons.map(({ id }) => id)));
  for (const world of worlds) {
    assert.ok(world.lessons.every((id) => lessons.find((lesson) => lesson.id === id)?.category === world.category));
  }
});

test('a completed region adds a one-time chest to first-time mastery rewards', () => {
  const completed = new Set<string>(worlds[0].lessons);
  assert.deepEqual(adventureRewards(12, completed), { xp: 120, level: 2, coins: 30, chests: 1 });
  completed.delete(worlds[0].lessons[0]);
  assert.equal(adventureRewards(8, completed).coins, 10);
});

test('FSRS orders due cards, replays legacy attempts and moves a corrected card forward', () => {
  const start = new Date(2026, 10, 23, 12).getTime();
  const missed = { lessonId: 'coffee', exerciseIndex: 0, correct: false, day: '2026-11-23', at: start };
  const other = { lessonId: 'shipping', exerciseIndex: 1, correct: true, day: '2026-11-23', at: start };
  const legacy = { lessonId: 'coffee', exerciseIndex: 0, correct: false, day: '2026-11-22' };
  const invalid = { ...missed, exerciseIndex: -1 };
  const history = [legacy, missed, other, invalid];
  const schedule = reviewSchedule(history, lessons);
  assert.equal(schedule.length, 2);
  assert.equal(schedule[0].lesson.id, 'coffee');
  const firstDue = +schedule[0].card.due;
  assert.ok(firstDue > start);
  const repeated = reviewSchedule([...history, { ...missed, correct: true, at: firstDue }], lessons);
  const coffee = repeated.find(({ lesson }) => lesson.id === 'coffee');
  assert.ok(coffee && +coffee.card.due > firstDue);
  assert.equal(+schedule[0].card.last_review!, start);
  assert.equal(+reviewSchedule([legacy], lessons)[0].card.last_review!, Date.parse('2026-11-22T00:00:00'));
});
import { wordMeaning } from '../src/wordMeaning.ts';

test('word taps align vocabulary and idioms with their sentence translation', () => {
  assert.deepEqual(wordMeaning('Could I have a latte, please?', 4, '请给我一杯拿铁。'), { meaning: '拿铁', matched: true });
  assert.deepEqual(wordMeaning('For here or to go?', 4, '在这里喝还是外带？'), { meaning: '外带', matched: true });
  assert.deepEqual(wordMeaning('The samples arrive on Monday.', 0, '样品星期一到达。'), { meaning: '定冠词', matched: false });
  for (const lesson of lessons) {
    const pairs = [...lesson.phrases];
    for (const exercise of lesson.exercises) {
      for (const text of [exercise.prompt, exercise.answer, ...('options' in exercise ? exercise.options : [])]) {
        const chinese = translatePracticeText(text);
        if (chinese) pairs.push([text, chinese]);
      }
    }
    for (const [english, chinese] of pairs) {
      const words = english.match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g) ?? [];
      words.forEach((word, index) => assert.ok(wordMeaning(english, index, chinese), word));
    }
  }
});
