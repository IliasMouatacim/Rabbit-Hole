import { useEffect, useRef } from 'react';
import { random } from './expedition-engine';
import { quizPool } from './quiz-data';

export default function GuardianEncounter({ world, seed, energy, selected, onAnswer, onFinish }: {
  world: string;
  seed: string;
  energy: number;
  selected?: string;
  onAnswer: (answer: string, correct: boolean) => void;
  onFinish: () => void;
}) {
  const rand = random(world + seed);
  const pool = quizPool(world);
  const question = pool[Math.floor(rand() * pool.length)];
  const answers = question.answers.map(text => ({ text, order: rand() })).sort((a, b) => a.order - b.order);
  const continueButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selected !== undefined) continueButton.current?.focus();
  }, [selected]);

  return <>
    <p>Wager 2 energy. A correct answer earns 2 energy. Walking away costs nothing.</p>
    <h3>{question.prompt}</h3>
    <div className="exp-bargain-options">
      {answers.map(({ text }) => <button key={text} disabled={selected !== undefined || energy <= 2} onClick={() => onAnswer(text, text === question.correct)}>{text}</button>)}
    </div>
    {selected !== undefined ? <>
      <p role="status">{selected === question.correct ? 'Correct.' : `The answer was “${question.correct}”.`} {question.fact}</p>
      <button className="exp-primary" ref={continueButton} onClick={onFinish}>Continue</button>
    </> : <button className="exp-primary" onClick={onFinish}>Leave without wagering</button>}
  </>;
}
