import type { Lesson } from './lessons';

export type Attempt = { lessonId: string; exerciseIndex: number; correct: boolean; day: string; at?: number };

export function normalizeAnswer(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
}

export function localDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function summarize(attempts: Attempt[]) {
  const mastered = new Set<string>();
  const mistakes = new Map<string, Attempt>();
  for (const attempt of attempts) {
    const key = exerciseKey(attempt.lessonId, attempt.exerciseIndex);
    if (attempt.correct) {
      mastered.add(key);
      mistakes.delete(key);
    } else {
      mistakes.set(key, attempt);
    }
  }
  return { mastered, mistakes: Array.from(mistakes.values()).reverse() };
}

export function exerciseKey(lessonId: string, index: number) {
  return `${lessonId}:${index}`;
}

export function remainingExercises(lesson: Lesson, mastered: ReadonlySet<string>) {
  return lesson.exercises.map((_, index) => index).filter((index) => !mastered.has(exerciseKey(lesson.id, index)));
}

export function nextLessonToPractice(
  lessons: Lesson[], attempts: Attempt[], remaining: ReadonlyMap<string, number[]>,
) {
  const incomplete = lessons.filter((lesson) => remaining.get(lesson.id)?.length);
  const byId = new Map(incomplete.map((lesson) => [lesson.id, lesson]));
  for (let index = attempts.length - 1; index >= 0; index--) {
    const recent = byId.get(attempts[index].lessonId);
    if (recent) return recent;
  }
  return incomplete[0];
}
