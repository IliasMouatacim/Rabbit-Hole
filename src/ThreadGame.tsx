import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowUpRight, RotateCcw, Undo2, Volume2, VolumeX, Sparkles, Zap, ChevronRight, Check, HelpCircle } from 'lucide-react';
import { canMove, levelLinks, move, positions, rating, sectors, startRun, won, type Run } from './thread-engine';
import './thread-game.css';

function readScores(): number[] {
  try { const data: unknown = JSON.parse(localStorage.getItem('rh-thread-stars') || '[]'); return sectors.map((_, i) => Array.isArray(data) && Number.isInteger(data[i]) && data[i] >= 0 && data[i] <= 3 ? data[i] : 0); } catch { return sectors.map(() => 0); }
}

export default function ThreadGame({ world, onHome, onExplore }: { world: string; onHome: () => void; onExplore: () => void }) {
  const [level, setLevel] = useState(Math.max(0, sectors.findIndex(s => s.id === world)));
  const [history, setHistory] = useState<Run[]>(() => [startRun(Math.max(0, sectors.findIndex(s => s.id === world)))]);
  const [scores, setScores] = useState(readScores);
  const [sound, setSound] = useState(false);
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState('Choose a glowing neighbour to move your spark.');
  const [pulse, setPulse] = useState(0);
  const audio = useRef<AudioContext | null>(null);
  const sector = sectors[level], run = history[history.length - 1], complete = won(run), stuck = !complete && !canMove(run, level);
  useEffect(() => () => { void audio.current?.close(); }, []);
  useEffect(() => {
    window.history.replaceState(null, '', `#play/${sector.id}`);
  }, [sector.id]);
  useEffect(() => {
    if (!complete) return;
    setScores(old => { const next = old.map((n, i) => i === level ? Math.max(n, rating(run)) : n); try { localStorage.setItem('rh-thread-stars', JSON.stringify(next)); } catch { /* Session remains playable. */ } return next; });
  }, [complete, level]);
  function tone(signal: boolean) {
    if (!sound) return;
    try {
      const ctx = audio.current ||= new AudioContext(); void ctx.resume();
      [0, ...(signal ? [1, 2] : [])].forEach((n) => { const oscillator = ctx.createOscillator(), gain = ctx.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = [392, 494, 587][n]; gain.gain.setValueAtTime(0, ctx.currentTime + n * .09); gain.gain.linearRampToValueAtTime(.045, ctx.currentTime + n * .09 + .02); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + n * .09 + .4); oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(ctx.currentTime + n * .09); oscillator.stop(ctx.currentTime + n * .09 + .42); });
    } catch { setSound(false); }
  }
  function travel(target: number) {
    const next = move(run, target, level);
    if (!next) { setNotice('Follow a glowing thread. Red nodes cost 3 energy.'); return; }
    const found = next.signals.length > run.signals.length;
    setHistory(old => [...old, next]); setPulse(p => p + 1); tone(found);
    setNotice(won(next) ? 'Beautifully connected. The garden is awake.' : found ? `Signal ${next.signals.length} of 3 recovered. Keep the light moving.` : next.charged.length > run.charged.length ? 'Recharged. +3 energy, once per node.' : target === 12 ? 'The exit needs all three signals. Keep exploring.' : 'Thread connected. Choose your next move.');
  }
  function reset(next = level) { setLevel(next); setHistory([startRun(next)]); setNotice('A fresh thread. Collect three signals, then reach the exit.'); }
  function undo() { if (history.length < 2) return; setHistory(old => old.slice(0, -1)); setNotice('One step back. Try a different thread.'); }
  const reached = new Set(run.trail);
  return <div className="thread-game" style={{ '--thread-accent': sector.color } as CSSProperties}>
    <header className="thread-header"><button onClick={onHome} className="thread-brand"><span>♧</span> rabbit hole<sup>PLAY</sup></button><div className="thread-edition">A SMALL GAME ABOUT CONNECTIONS</div><button onClick={onExplore}>Free exploration <ArrowUpRight size={15}/></button></header>
    <main className="thread-shell">
      <div className="thread-titlebar"><div><span className="thread-eyebrow">THE CURIOSITY ARCADE / 001</span><h1>Follow the <em>thread.</em><span>✳</span></h1></div><div className="thread-title-note">A spark. A web. A way through.<br/><span>Take your time. Make a connection.</span></div></div>
      <nav className="thread-sectors" aria-label="Game worlds">{sectors.map((s,i)=><button key={s.id} aria-current={level===i?'step':undefined} onClick={()=>reset(i)}><span className="thread-sector-number">{scores[i] ? <Check size={13}/> : `0${i+1}`}</span><span>{s.world}<small>{scores[i] ? '★'.repeat(scores[i]) : i===level?'NOW PLAYING':'EXPLORE'}</small></span>{i===level&&<i/>}</button>)}</nav>
      <div className="thread-play-layout">
        <section className="thread-board" aria-label="Interactive thread puzzle">
          <div className="thread-board-top"><span><i/> {sector.world.toUpperCase()} / SECTOR 0{level+1}</span><button onClick={()=>setHelp(!help)} aria-expanded={help}><HelpCircle size={15}/> How to play</button></div>
          <div className="thread-pocket-hud"><span><Zap size={12}/><strong>{run.energy}</strong> energy</span><span>◇ <strong>{run.signals.length}/3</strong> signals</span><button onClick={undo} disabled={history.length<2} aria-label="Undo move on board"><Undo2 size={13}/></button></div>
          {help && <div className="thread-help"><strong>Your spark moves along connected threads.</strong> Collect all 3 diamond signals, then reach the ringed exit. Each step costs 1 energy; red nodes cost 3. Green nodes return 3 energy once. Undo restores your previous move, including energy. There’s no timer.<button onClick={()=>setHelp(false)}>Got it <Check size={14}/></button></div>}
          <div className="thread-web-wrap">
            <svg viewBox="0 0 700 640" className="thread-web" role="group" aria-label="Move to a connected node">
              <defs><radialGradient id="thread-halo"><stop stopColor={sector.color} stopOpacity=".11"/><stop offset="1" stopColor={sector.color} stopOpacity="0"/></radialGradient><filter id="thread-glow"><feGaussianBlur stdDeviation="3"/></filter></defs>
              <circle cx="350" cy="320" r="310" fill="url(#thread-halo)"/>
              {[75,130,190,255,300].map(r=><circle key={r} cx="350" cy="320" r={r} className="thread-guide"/>)}
              {Array.from({length:48},(_,i)=>{const a=i*2.39996,r=90+(i%5)*43;return <circle key={i} cx={350+Math.cos(a)*r} cy={320+Math.sin(a)*r} r={i%7===0?1.5:.7} fill={sector.color} opacity=".35"/>;})}
              {levelLinks(level).map(([a,b])=>{const lit=a===run.node||b===run.node;const used=run.trail.some((n,i)=>i>0&&((n===a&&run.trail[i-1]===b)||(n===b&&run.trail[i-1]===a))); return <line key={`${a}-${b}`} x1={positions[a].x} y1={positions[a].y} x2={positions[b].x} y2={positions[b].y} className={`thread-link ${used?'is-travelled':''} ${lit?'is-available':''}`}/>;})}
              {positions.map((p,i)=>{
                const signal=sector.signals.includes(i), collected=run.signals.includes(i), charge=sector.charges.includes(i), drained=run.charged.includes(i), hazard=sector.hazards.includes(i), current=run.node===i, exit=i===12, available=!!move(run,i,level);
                const label=current?`Your spark, node ${i}`:`${exit?'Exit':signal?`Signal ${sector.signals.indexOf(i)+1}${collected?', collected':''}`:charge?`Recharge${drained?', used':''}`:hazard?'Hazard, costs 3 energy':'Junction'}, node ${i}`;
                return <g key={i} role="button" tabIndex={complete?-1:0} aria-label={label} aria-disabled={!available} onClick={()=>travel(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();travel(i);}}} transform={`translate(${p.x} ${p.y})`} className={`thread-node ${current?'is-current':''} ${available?'can-travel':''} ${collected?'is-collected':''} ${hazard?'is-hazard':''} ${charge&&!drained?'is-charge':''} ${reached.has(i)?'is-reached':''}`}>
                  <circle r="38" fill="transparent" stroke="none"/>
                  {current&&<circle r="35" className="thread-player-aura" key={pulse}/>}
                  {(exit||signal)&&<circle r={exit?27:24} className={`thread-special-ring ${exit&&run.signals.length===3?'exit-open':''}`}/>}
                  <circle r="17" className="thread-node-body"/>
                  {current?null:collected?<path d="M-6 0L-1 5L7-5" className="thread-node-symbol"/>:signal?<path d="M0-8L6 0L0 8L-6 0Z" className="thread-node-symbol"/>:charge&&!drained?<path d="M2-8L-5 1H1L-1 8L6-2H0Z" className="thread-node-symbol"/>:exit?<path d="M-5 0H6M1-5L6 0L1 5" className="thread-node-symbol"/>:hazard?<path d="M0-6V1M0 5V6" className="thread-node-symbol"/>:<circle r="3" fill="currentColor"/>}
                  <text y="43" textAnchor="middle">{current?'YOU':exit?'EXIT':signal?collected?'FOUND':`SIGNAL 0${sector.signals.indexOf(i)+1}`:charge&&!drained?'+3':hazard?'−3':''}</text>
                </g>;
              })}
              <g className="thread-moving-spark" style={{ transform: `translate(${positions[run.node].x}px, ${positions[run.node].y}px)` }} aria-hidden="true"><circle r="13" className="thread-spark" filter="url(#thread-glow)" opacity=".6"/><circle r="6" className="thread-spark"/></g>
            </svg>
            {!complete&&!stuck&&<div className="thread-board-caption">{sector.subtitle}</div>}
            {(complete||stuck)&&<div className="thread-result" role="status"><span>{complete?'✳':'↺'}</span><small>{complete?'SECTOR CONNECTED':'A THREAD WORTH RETHINKING'}</small><h2>{complete?'You found a way.':'Out of energy.'}</h2><p>{complete?`${run.trail.length-1} moves. ${run.energy} energy left. ${'★'.repeat(rating(run))}`:'Undo a move or try a different route. Every puzzle has a way through.'}</p><button onClick={()=>complete?reset((level+1)%sectors.length):undo()}>{complete?level===4?'Play the first world again':'Next world':'Undo last move'} <ChevronRight size={17}/></button><button className="thread-result-secondary" onClick={()=>reset()}>{complete?'Try for a cleaner route':'Start fresh'}</button></div>}
          </div>
          <div className="thread-board-bottom"><div><span className="legend-signal">◇</span> Signal <span className="legend-charge">ϟ</span> Recharge <span className="legend-hazard">!</span> Hazard</div><button onClick={()=>setSound(!sound)} aria-pressed={sound} aria-label={sound?'Mute game sound':'Enable game sound'}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button></div>
        </section>
        <aside className="thread-mission"><span className="thread-eyebrow">YOUR EXPEDITION</span><h2>{sector.name}</h2><p>Wake the web. Bring three scattered signals back into connection.</p>
          <div className="thread-energy"><div><span><Zap size={14}/> ENERGY</span><strong>{run.energy}<small> / {sector.energy}</small></strong></div><div className="thread-energy-track"><i style={{width:`${Math.min(100,run.energy/sector.energy*100)}%`}}/></div><span>Every move uses energy. Choose your route.</span></div>
          <div className="thread-objective"><span>01 / COLLECT THE SIGNALS</span><div>{sector.signals.map((n,i)=><div key={n} className={run.signals.includes(n)?'found':''}><span>{run.signals.includes(n)?<Check size={19}/>:'◇'}</span><small>0{i+1}</small></div>)}</div></div>
          <div className={`thread-exit-task ${run.signals.length===3?'ready':''}`}><span>{complete?<Check size={19}/>:<ArrowUpRight size={19}/>}</span><div><small>02 / FIND YOUR WAY OUT</small><strong>{complete?'Beautifully connected':run.signals.length===3?'Exit is ready':'Reach the ringed exit'}</strong></div></div>
          <div className="thread-feedback" role="status" aria-live="polite" key={notice}><Sparkles size={16}/><p>{notice}</p></div>
          <div className="thread-controls"><button onClick={undo} disabled={history.length<2}><Undo2 size={16}/> Undo</button><button onClick={()=>reset()}><RotateCcw size={15}/> Restart</button></div>
          <div className="thread-run-stats"><span><strong>{String(run.trail.length-1).padStart(2,'0')}</strong> MOVES</span><span><strong>{scores.filter(Boolean).length}/5</strong> WORLDS CONNECTED</span></div>
          <button className="thread-back" onClick={onExplore}><ArrowLeft size={13}/> Explore questions instead</button>
        </aside>
      </div>
      <footer className="thread-footer"><span>MADE FOR GETTING A LITTLE LOST.</span><span>NO TIMER. JUST ONE MORE MOVE. ↗</span></footer>
    </main>
  </div>;
}
