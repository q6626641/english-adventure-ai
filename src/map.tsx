import { ArrowRight, Check, ChevronRight, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import { m, useReducedMotion } from 'motion/react';
import type { Lesson } from './lessons';
import { worlds } from './worlds';

export const art = (name: string) => import.meta.env.BASE_URL + 'kenney/' + name;
const tile = (index: number) => art('tile_' + String(index).padStart(4, '0') + '.png');

export function HeroArt() {
  return (
    <div className="island-scene" aria-hidden="true">
      <div className="island-sun" /><div className="island-cloud cloud-one" /><div className="island-cloud cloud-two" />
      <div className="island-land" /><div className="island-trail" />
      <img className="scene-tree scene-tree-left" src={tile(16)} alt="" />
      <img className="scene-tree scene-tree-right" src={tile(5)} alt="" />
      <img className="scene-flowers" src={tile(2)} alt="" />
      <img className="scene-chest" src={art('chest.png')} alt="" />
      <m.img className="scene-mascot" src={art('companion.png')} alt=""
        initial={{ scale: .9 }} animate={{ scale: 1 }} transition={{ duration: .35 }} />
      <img className="scene-star" src={art('star.png')} alt="" />
    </div>
  );
}

export function AdventureMap({ lessons, category, remaining, activeId, onOpen }: {
  lessons: Lesson[];
  category: Lesson['category'] | '全部';
  remaining: ReadonlyMap<string, number[]>;
  activeId?: string;
  onOpen: (lesson: Lesson) => void;
}) {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const shown = worlds.filter((world) => category === '全部' || category === world.category);
  return (
    <div className="worlds">
      {shown.map((world) => {
        const cleared = world.lessons.filter((id) => remaining.get(id)?.length === 0).length;
        return (
          <section className="world" data-theme={world.theme} key={world.id} aria-labelledby={'world-' + world.id}>
            <header className="world-head">
              <div className="world-tile" style={{ '--grass': 'url(' + tile(1) + ')' } as CSSProperties} aria-hidden="true">
                {world.landmark.map((index, position) => <img key={position} src={tile(index)} alt="" />)}
              </div>
              <div><h3 id={'world-' + world.id}>{world.name}</h3><p>{world.category} · {cleared}/{world.lessons.length} 关</p></div>
              <span className="world-chest" data-earned={cleared === world.lessons.length}>
                <img src={art('chest.png')} alt="" />
                {cleared === world.lessons.length ? '宝箱已获得' : '全通关得宝箱'}
              </span>
            </header>
            <ol className="world-trail">
              {world.lessons.map((id, position) => {
                const lesson = byId.get(id);
                if (!lesson) return null;
                const mastered = lesson.exercises.length - (remaining.get(id)?.length ?? 0);
                const complete = mastered === lesson.exercises.length;
                return (
                  <li key={id}>
                    <button className="stage" data-active={id === activeId} data-complete={complete}
                      onClick={() => onOpen(lesson)}>
                      <span className="stage-marker" aria-hidden="true">
                        {complete ? <Check size={21} /> : position + 1}
                      </span>
                      <span className="stage-copy"><strong>{lesson.title}</strong><small>{mastered}/{lesson.exercises.length} 题掌握</small></span>
                      {id === activeId ? <ArrowRight size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

export function RewardArt({ perfect, treasure, animations }: { perfect: boolean; treasure: boolean; animations: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <m.div className="reward-art" initial={animations && !reduceMotion ? { opacity: 0, scale: .76 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }} aria-hidden="true">
      <Sparkles className="reward-sparkle" size={36} />
      <img src={art(treasure ? 'chest.png' : perfect ? 'companion-jump.png' : 'companion.png')} alt="" />
      <img src={art('star.png')} className="reward-star" alt="" />
    </m.div>
  );
}
