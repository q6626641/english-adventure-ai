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

export function PronounceText({ text, play, disabled = false }: {
  text: string;
  play: (text: string) => void;
  disabled?: boolean;
}) {
  return text.split(wordParts).map((part, index) => {
    if (index % 2 === 0) return part;
    return (
      <button key={index} type="button" lang="en" className="pronounce-word"
        disabled={disabled} aria-label={`朗读单词 ${part}`} onClick={() => play(part)}>
        {part}
      </button>
    );
  });
}
