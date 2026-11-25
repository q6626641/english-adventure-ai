import { wordMeaning } from './wordMeaning';
import { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speak } from './platform';

export function usePronunciation() {
  const [error, setError] = useState('');
  const playback = useRef(0);

  function play(text: string) {
    const request = ++playback.current;
    setError('');
    void speak(text).catch((issue: unknown) => {
      if (request === playback.current) {
        setError(issue instanceof Error ? issue.message : String(issue));
      }
    });
  }

  return { error, setError, play };
}

export function ReadAloud() {
  const [text, setText] = useState('');
  const { error, play } = usePronunciation();

  return (
    <div className="reader">
      <form className="reader-form" onSubmit={(event) => {
        event.preventDefault();
        if (text.trim()) play(text.trim());
      }}>
        <input type="text" lang="en" aria-label="输入要朗读的英文"
          placeholder="输入英语单词或句子" value={text} autoComplete="off"
          onChange={(event) => setText(event.target.value)} />
        <button type="submit" className="reader-speaker" disabled={!text.trim()} aria-label="朗读输入内容">
          <Volume2 size={21} aria-hidden="true" />
        </button>
      </form>
      {error && <p className="error reader-error" role="alert">{error}</p>}
    </div>
  );
}

const wordParts = /([A-Za-z]+(?:[’'-][A-Za-z]+)*)/;

export function PronounceText({ text, play, disabled = false, chinese, showTranslation = false }: {
  text: string;
  play: (text: string) => void;
  disabled?: boolean;
  chinese?: string;
  showTranslation?: boolean;
}) {
  const [selected, setSelected] = useState<number>();
  const parts = text.split(wordParts);
  const meaning = selected === undefined || !chinese ? undefined : wordMeaning(text, (selected - 1) / 2, chinese);
  const offset = meaning?.matched ? chinese!.indexOf(meaning.meaning) : -1;
  return <>
    {parts.map((part, index) => index % 2 === 0 ? part : (
      <button key={index} type="button" lang="en" className="pronounce-word"
        data-selected={index === selected} disabled={disabled} aria-label={`朗读单词 ${part}`}
        onClick={() => { setSelected(index); play(part); }} onBlur={() => setSelected(undefined)}>{part}</button>
    ))}
    {chinese && (showTranslation || meaning) && <small className="translation" lang="zh-CN" aria-live="polite">
      {showTranslation && (offset >= 0 && meaning
        ? <>{chinese.slice(0, offset)}<mark>{meaning.meaning}</mark>{chinese.slice(offset + meaning.meaning.length)}</>
        : chinese)}
      {meaning && (!showTranslation || !meaning.matched) &&
        <span className="word-gloss">{parts[selected!]} · <mark>{meaning.meaning}</mark></span>}
    </small>}
  </>;
}
