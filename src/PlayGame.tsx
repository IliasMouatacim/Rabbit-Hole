import { lazy, Suspense, useState } from 'react';

const Expedition = lazy(() => import('./Expedition'));
const QuizGame = lazy(() => import('./QuizGame'));

export default function PlayGame(props: { world: string; onHome: () => void; onExplore: () => void }) {
  const [adventure, setAdventure] = useState(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    return ['expedition', 'descent', 'daily'].includes(params.get('run') || '') || params.get('adventure') === '1';
  });

  return <Suspense fallback={<div className="cinema-loading">WAKING THE WEB</div>}>
    {adventure ? <Expedition {...props} /> : <QuizGame {...props} onAdventure={() => setAdventure(true)} />}
  </Suspense>;
}
