import { useState } from 'react';
import { random } from './expedition-engine';
import { quizPool } from './quiz-data';

export default function GuardianEncounter({ world, seed, energy, onFinish }: {
  world: string;
  seed: string;
  energy: number;
  onFinish: (correct: boolean | null) => void;
}) {
  const rand = random(world + seed);
  const pool = quizPool(world);
  const question = pool[Math.floor(rand() * pool.length)];
  const answers = question.answers.map(text => ({ text, order: rand() })).sort((a, b) => a.order - b.order);
  const [selected, setSelected] = useState<string | null>(null);

  return <>
    <p>Wager 2 energy. A correct answer earns 2 energy. Walking away costs nothing.</p>
    <h3>{question.prompt}</h3>
    <div className="exp-bargain-options">
      {answers.map(({ text }) => <button key={text} disabled={selected !== null || energy <= 2} onClick={() => setSelected(text)}>{text}</button>)}
    </div>
    {selected !== null ? <>
      <p role="status">{selected === question.correct ? 'Correct.' : `The answer was “${question.correct}”.`} {question.fact}</p>
      <button className="exp-primary" onClick={() => onFinish(selected === question.correct)}>Continue</button>
    </> : <button className="exp-primary" onClick={() => onFinish(null)}>Leave without wagering</button>}
  </>;
}
