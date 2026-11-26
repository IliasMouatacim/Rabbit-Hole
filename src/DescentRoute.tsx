import { Check, Leaf, Moon, Music2, Target, Waves } from 'lucide-react';
import { descentWorlds } from './descent-profile';
import { sectors } from './thread-engine';
import type { CSSProperties } from 'react';
import './descent-route.css';

const icons = { ocean: Waves, forest: Leaf, dreams: Moon, football: Target, music: Music2 };

export default function DescentRoute({ completed = 0, current }: { completed?: number; current?: string }) {
  return <ol className="descent-route" aria-label="Five-world Descent route">
    {descentWorlds.map((id, index) => {
      const sector = sectors.find(item => item.id === id)!;
      const Icon = icons[id as keyof typeof icons];
      const cleared = index < completed;
      return <li key={id} data-cleared={cleared} aria-current={id === current ? 'step' : undefined}
        style={{ '--stop-color': sector.color } as CSSProperties}>
        <span className="descent-route-icon" aria-hidden="true"><Icon size={17} /></span>
        <span className="descent-route-name">{sector.world}</span>
        <span className="descent-route-state">{cleared ? <><Check size={12} aria-hidden="true" /> Cleared</> : id === current ? 'Here' : index === descentWorlds.length - 1 ? 'Final world' : `Depth ${index + 1}`}</span>
      </li>;
    })}
  </ol>;
}
