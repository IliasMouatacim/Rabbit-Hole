import { useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, Shuffle } from 'lucide-react';
import './observatory.css';

const worlds = [
  { id: 'ocean', name: 'The deep unknown', label: 'Ocean', color: '#76e0ed', question: 'What lives where light gives up?', detail: 'Descend past the last sunlight. Find a world that rewrote the rules of life.', tag: '01 / INTO THE ABYSS', shape: 'ocean' },
  { id: 'forest', name: 'A secret society', label: 'Nature', color: '#c0ee88', question: 'Can a forest think together?', detail: 'Follow the hidden connections between living things. Break a link. See what survives.', tag: '02 / UNDER THE SURFACE', shape: 'forest' },
  { id: 'dreams', name: 'Beautiful illusions', label: 'Mind', color: '#c3a5ff', question: 'How much of reality do you invent?', detail: 'Your brain is telling you a story. Step inside the strange machinery behind it.', tag: '03 / QUESTION REALITY', shape: 'mind' },
  { id: 'football', name: 'The invisible game', label: 'Football', color: '#ffd48b', question: 'Can empty space win a match?', detail: 'Move the players. Open a passing lane. Discover the game happening between the players.', tag: '04 / SEE THE UNSEEN', shape: 'football' },
  { id: 'music', name: 'Organised emotion', label: 'Music', color: '#ff9daf', question: 'Why does a sound give you chills?', detail: 'Bend a melody and play with expectation. Follow a feeling into the science of sound.', tag: '05 / FEEL THE FREQUENCY', shape: 'music' },
];

export default function Observatory({ onEnter, onDescend }: { onEnter: (id: string) => void; onDescend: () => void }) {
  const [active, setActive] = useState(0);
  const world = worlds[active];
  return <section className="observatory" style={{ '--world-glow': world.color } as CSSProperties} aria-label="Curiosity observatory">
    <div className="observatory-topline"><span><i /> A PLAYGROUND FOR THE CURIOUS</span><span>FIVE WORLDS. NO STRAIGHT LINES.</span></div>
    <div className="observatory-layout">
      <div className="observatory-copy">
        <span className="observatory-kicker">GET A LITTLE LOST.</span>
        <h1>Nothing exists<br />in <em>isolation.</em><sup><ArrowUpRight size={32}/></sup></h1>
        <p>Pull on a question. Unravel a world.<br />See where your curiosity takes you.</p>
        <button className="observatory-enter" onClick={() => onEnter(world.id)}>Enter the rabbit hole <ArrowUpRight size={20} /></button>
        <button className="observatory-random" onClick={() => setActive((active + 1 + Math.floor(Math.random() * 4)) % 5)}><Shuffle size={14} /> Surprise me with a world</button>
        <div className="observatory-footnote"><span>✳</span> No score. No right path.<br />Just a very good question.</div>
      </div>
      <div className="observatory-instrument">
        <div className="observatory-coordinate">INTERCONNECTED SYSTEM / LIVE EXPLORATION <span>+ 00{active + 1}</span></div>
        <div className={`observatory-web is-${world.shape}`}>
          <svg viewBox="0 0 700 650" className="observatory-threads" aria-hidden="true">
            <defs><radialGradient id="web-light"><stop stopColor="currentColor" stopOpacity=".25"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></radialGradient></defs>
            <circle cx="350" cy="325" r="300" fill="url(#web-light)" stroke="none"/>
            {[85,145,205,270].map((r) => <path key={r} d={Array.from({length:13},(_,i)=>{const a=i*Math.PI/6;return `${i?'L':'M'}${350+Math.cos(a)*r} ${325+Math.sin(a)*r}`}).join(' ')+'Z'}/>)}
            {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <line key={i} x1="350" y1="325" x2={350+Math.cos(a)*310} y2={325+Math.sin(a)*310}/>;})}
            {Array.from({length:36},(_,i)=>{const a=i*2.39996;const r=110+(i%4)*49;return <circle key={i} cx={350+Math.cos(a)*r} cy={325+Math.sin(a)*r} r={i%6===0?3:1.4} fill="currentColor"/>;})}
          </svg>
          <div className="observatory-specimen" aria-hidden="true">
            <svg viewBox="0 0 300 300"><defs><radialGradient id="specimen-light"><stop stopColor="#fff" stopOpacity=".85"/><stop offset=".2" stopColor="currentColor" stopOpacity=".65"/><stop offset="1" stopColor="currentColor" stopOpacity=".03"/></radialGradient></defs>
              <circle cx="150" cy="150" r="120" fill="url(#specimen-light)"/>
              {Array.from({length:22},(_,i)=><ellipse key={i} cx="150" cy="150" rx={40+i*3.5} ry={112-i*2} transform={`rotate(${i*17} 150 150)`} fill="none" stroke="currentColor" strokeWidth=".65" opacity={.25+i*.025}/>)}
              <circle cx="150" cy="150" r="20" fill="currentColor" opacity=".4"/>
            </svg>
          </div>
          {worlds.map((w,i)=>{const a=(i*72-90)*Math.PI/180;return <button key={w.id} style={{left:`${50+Math.cos(a)*39}%`,top:`${50+Math.sin(a)*39}%`}} className={`observatory-node ${i===active?'is-active':''}`} onClick={()=>setActive(i)} aria-pressed={i===active} aria-label={`Preview ${w.label}`}><span className="observatory-node-dot"/><span>{w.label}</span></button>;})}
          <span className="specimen-caption">SPECIMEN {String(active+1).padStart(3,'0')} / {world.label.toUpperCase()}</span>
        </div>
        <div className="observatory-preview" key={world.id}><span>{world.tag}</span><button onClick={()=>onEnter(world.id)}>{world.question}<ArrowUpRight size={22}/></button><p>{world.detail}</p></div>
      </div>
    </div>
    <div className="observatory-worlds">{worlds.map((w,i)=><button key={w.id} onClick={()=>setActive(i)} aria-pressed={active===i}><span>0{i+1} / {w.label}</span><strong>{w.name}</strong><ArrowUpRight size={16}/></button>)}</div>
    <button className="observatory-descend" onClick={onDescend}>Or start with a question <ArrowDown size={14}/></button>
  </section>;
}
