import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs';
import { exerciseKey, type Attempt } from './learning.ts';
import type { Lesson } from './lessons';

const scheduler = fsrs({ enable_fuzz: false });

export function reviewSchedule(attempts: readonly Attempt[], lessons: readonly Lesson[]) {
  const cards = new Map<string, { lesson: Lesson; index: number; card: Card }>();
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  for (const attempt of attempts) {
    const lesson = byId.get(attempt.lessonId);
    if (!lesson?.exercises[attempt.exerciseIndex]) continue;
    const key = exerciseKey(lesson.id, attempt.exerciseIndex);
    const previous = cards.get(key)?.card;
    // Older records have only a local calendar date. Preserve their recorded order.
    const time = attempt.at ?? Date.parse(attempt.day + 'T00:00:00');
    if (!Number.isFinite(time)) continue;
    const date = new Date(Math.max(time, previous?.last_review?.getTime() ?? time));
    const { card } = scheduler.next(previous ?? createEmptyCard(date), date,
      attempt.correct ? Rating.Good : Rating.Again);
    cards.set(key, { lesson, index: attempt.exerciseIndex, card });
  }
  return [...cards.values()].sort((left, right) => +left.card.due - +right.card.due);
}
