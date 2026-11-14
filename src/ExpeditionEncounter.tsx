import { useEffect, useRef, useState } from 'react';
import { Check, Play, Sparkles, X } from 'lucide-react';

const discoveries: Record<string, { title: string; fact: string; source: string }[]> = {
  ocean: [
    { title: 'Life without sunlight', fact: 'At hydrothermal vents, microbes can use chemical energy to produce organic matter. These food webs do not need sunlight to reach their habitat.', source: 'https://oceanexplorer.noaa.gov/facts/chemosynthesis.html' },
    { title: 'Sound in the dark', fact: 'Sound travels much faster through seawater than through air. Some marine animals use returning echoes to find objects in darkness.', source: 'https://oceanservice.noaa.gov/facts/sound.html' },
    { title: 'A connected ocean', fact: 'Ocean life depends on moving resources and interacting organisms. Our valve puzzle is a routing metaphor, not a model of an actual ecosystem.', source: 'https://oceanexplorer.noaa.gov/' },
  ],
  forest: [
    { title: 'A connected beginning', fact: 'A tree in graph theory connects every vertex without cycles. This puzzle uses a mathematical network; it does not imply that forests act as one mind.', source: 'https://www.britannica.com/science/graph-theory' },
    { title: 'One broken link', fact: 'A connection that is the only route between two parts of a network is a point of vulnerability. A replacement path can restore connectivity.', source: 'https://www.britannica.com/science/graph-theory' },
    { title: 'Resilience needs alternatives', fact: 'A cycle provides an alternate route if one of its links fails. Connectivity is useful for thinking about resilience, although real ecosystems are much more complex.', source: 'https://www.britannica.com/science/graph-theory' },
  ],
  dreams: [
    { title: 'A fleeting trace', fact: 'Working memory holds information for short periods. This sequence game illustrates short-term retention, not a cognitive assessment.', source: 'https://www.britannica.com/science/memory-psychology' },
    { title: 'Patterns lighten the load', fact: 'Grouping information into meaningful units can help us remember it. Your remembered motif is one small example of organising a sequence.', source: 'https://www.britannica.com/science/memory-psychology' },
    { title: 'Remembering is reconstruction', fact: 'Remembering is not simply replaying a recording. Retrieval can reconstruct an experience and is open to errors. A game score cannot diagnose memory ability.', source: 'https://www.britannica.com/science/memory-psychology' },
  ],
  football: [
    { title: 'Space changes the options', fact: 'Moving a receiver can open a passing lane. Our static geometry omits anticipation, ball speed, pressure, and most of a real match.', source: 'https://www.fifatrainingcentre.com/' },
    { title: 'Angles offer alternatives', fact: 'Receivers at different angles offer a ball carrier different passing options. In this illustration, a line clears a fixed defender; a real defender can move.', source: 'https://www.fifatrainingcentre.com/' },
    { title: 'The game off the ball', fact: 'Off-ball positioning changes the choices available to teammates. A clean line in this puzzle is an option, not a guarantee that a pass succeeds in a match.', source: 'https://www.fifatrainingcentre.com/' },
  ],
  music: [
    { title: 'Expectation makes a pattern', fact: 'Musical patterns create expectations. Here you repeat a visible motif; this is a pattern puzzle, not a test of musical ability.', source: 'https://www.britannica.com/art/music' },
    { title: 'A motif can travel', fact: 'A short, recognisable musical idea can recur and vary through a piece. Our repeating pitches illustrate a small motif rather than a full composition.', source: 'https://www.britannica.com/art/music' },
    { title: 'Repetition meets surprise', fact: 'Musicians use repetition and variation to give structure to sound. Remembering a longer motif here asks you to recognise that structure.', source: 'https://www.britannica.com/art/music' },
  ],
};

export default function ExpeditionEncounter({ world, stage, seed, onComplete, onLeave, sound }: { world: string; stage: number; seed: string; onComplete: (title: string) => void; onLeave: () => void; sound: boolean }) {
  const data = discoveries[world] || discoveries.ocean, discovery = data[Math.min(stage, data.length - 1)];
  const kind = world === 'forest' ? 'network' : world === 'football' ? 'football' : world === 'dreams' || world === 'music' || world === 'ocean' && stage === 1 ? 'sequence' : world === 'ocean' && stage === 2 ? 'valves' : 'vent';
  const [depth, setDepth] = useState(1800), [flow, setFlow] = useState(25), [chemical, setChemical] = useState(false);
  const [selected, setSelected] = useState<number[]>([]), [feedback, setFeedback] = useState(''), [watch, setWatch] = useState(-1), [playing, setPlaying] = useState(false), [solved, setSolved] = useState(false);
  const [players, setPlayers] = useState([95, 120, 145]);
  const heading = useRef<HTMLHeadingElement>(null), timers = useRef<ReturnType<typeof setTimeout>[]>([]), audio = useRef<AudioContext | null>(null);
  const first = (seed.charCodeAt(0) + stage) % 4, pattern = Array.from({length: stage === 0 ? 3 : 4 + (stage === 2 ? 1 : 0)}, (_,i)=>(first + [0,2,1,3,0][i]) % 4);
  useEffect(() => { heading.current?.focus(); return () => { timers.current.forEach(clearTimeout); void audio.current?.close(); }; }, []);
  function tone(n: number) { if (!sound) return; try { const ctx = audio.current ||= new AudioContext(); void ctx.resume(); const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = [262,330,392,494][n]; g.gain.setValueAtTime(.04,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.35); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+.4); } catch { /* Visual sequence remains fully playable. */ } }
  function replay() {
    timers.current.forEach(clearTimeout); setSelected([]); setFeedback('Watch the lights. Then repeat the pattern.'); setPlaying(true);
    pattern.forEach((n,i)=>{ timers.current.push(setTimeout(()=>{setWatch(n);tone(n);},i*700+250)); timers.current.push(setTimeout(()=>setWatch(-1),i*700+700)); });
    timers.current.push(setTimeout(()=>{setPlaying(false);setFeedback('Your turn. You can replay as often as you like.');},pattern.length*700+300));
  }
  function tap(n: number) {
    if (playing || solved) return; tone(n);
    const next = [...selected,n];
    if (pattern[next.length-1] !== n) { setSelected([]); setFeedback('That echo was different. Replay the pattern and try again. No energy lost.'); return; }
    setSelected(next); if(next.length===pattern.length) setSolved(true);
  }
  const netEdges = [[0,1],[1,2],[2,3],[0,3],[0,2]];
  const seen = new Set([0]); for(let i=0;i<4;i++) for(const n of selected){const [a,b]=netEdges[n]||[];if(seen.has(a))seen.add(b);if(seen.has(b))seen.add(a);}
  const openLanes = players.filter((y,i)=>Math.abs(120+(y-120)*(155/(225+i*30)))>0 && Math.abs((y-120)*(155/(225+i*30)))>23).length;
  const correct = kind==='vent'?depth>=2500&&depth<=3500&&flow>=45&&flow<=65&&chemical:kind==='network'?selected.length===3&&seen.size===4:kind==='football'?openLanes===3:kind==='valves'?selected.length===2&&selected.reduce((sum,n)=>sum+[2,3,5][n],0)===5:solved;
  function toggle(n:number) { setSelected(old=>old.includes(n)?old.filter(v=>v!==n):[...old,n]); }
  const title = kind==='vent'?'Bring the vent to life':kind==='sequence'?world==='music'?'Catch the melody':'An echo in the dark':kind==='network'?'Repair the living network':kind==='football'?'Create three passing lanes':'Keep the oxygen flowing';
  return <div className="exp-modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="encounter-title" className="exp-encounter" onKeyDown={e=>{if(e.key==='Escape')onLeave();if(e.key==='Tab'){const all=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]'));const a=all[0],z=all[all.length-1];if(e.shiftKey&&(document.activeElement===a||document.activeElement===heading.current)){e.preventDefault();z?.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a?.focus();}}}}>
    <div className="exp-modal-top"><span>FIELD ENCOUNTER / FRAGMENT 0{stage+1}</span><button onClick={onLeave} aria-label="Leave encounter"><X size={18}/></button></div>
    <h2 id="encounter-title" tabIndex={-1} ref={heading}>{solved?'A little less unknown.':title}</h2>
    {!solved && <>
      {kind==='vent'&&<><p>Build a vent habitat: descend to 2,500–3,500 m, use chemical energy, and balance flow inside the marked band. This is an illustrative puzzle.</p><div className="exp-vent-art"><div className="exp-vent-plume"/><div className="exp-vent-rock"/><span>{chemical?'ϟ CHEMICAL ENERGY':'☼ WAITING FOR AN ENERGY SOURCE'}</span><i style={{opacity:correct?1:.25}}>✳ ✳ ✳</i></div><label>Depth <strong>{depth} m</strong><input aria-label="Habitat depth" type="range" min="1000" max="4000" step="100" value={depth} onChange={e=>setDepth(+e.target.value)}/></label><label>Vent flow <strong>{flow}% · target 45–65%</strong><input aria-label="Vent flow" type="range" min="0" max="100" value={flow} onChange={e=>setFlow(+e.target.value)}/></label><button className={`exp-energy-switch ${chemical?'active':''}`} aria-pressed={chemical} onClick={()=>setChemical(!chemical)}>ϟ {chemical?'Chemical energy connected':'Connect chemical energy'}</button></>}
      {kind==='sequence'&&<><p>{world==='music'?'Listen or watch.':'Something in the dark is sending a signal.'} Repeat the {pattern.length}-part pattern. Colour, symbols, and optional sound give the same information. No timing score.</p><button className="exp-pattern-play" onClick={replay} disabled={playing}><Play size={16}/> {playing?'Watch the signal…':'Play the pattern'}</button><div className="exp-pattern-pad">{['◇','◉','△','✳'].map((icon,i)=><button key={i} onClick={()=>tap(i)} disabled={playing} className={watch===i?'lit':''} aria-label={`Signal ${i+1}`}><span>{icon}</span><small>{i+1}</small></button>)}</div><div className="exp-pattern-progress">{pattern.map((_,i)=><i key={i} className={i<selected.length?'done':''}/>)}</div></>}
      {kind==='network'&&<><p>Reconnect all four organisms using exactly three links. Pick edges to build a connected network without wasting a link.</p><svg className="exp-network" viewBox="0 0 400 220">{netEdges.map(([a,b],i)=>{const pts=[[80,55],[320,55],[320,170],[80,170]];return <g key={i} role="button" tabIndex={0} aria-label={`Toggle link ${i+1}`} onClick={()=>toggle(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(i);}}}><line x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="transparent" strokeWidth="25"/><line x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={selected.includes(i)?'#c9f78b':'#435b4c'} strokeWidth={selected.includes(i)?4:2}/><text x={(pts[a][0]+pts[b][0])/2} y={(pts[a][1]+pts[b][1])/2-8} fill="#aac5b3" fontSize="12">{i+1}</text></g>;})}{[[80,55],[320,55],[320,170],[80,170]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="20" fill="#263e2c" stroke="#c9f78b"/><text x={x} y={y+5} textAnchor="middle" fill="#c9f78b">{i+1}</text></g>)}</svg><span className="exp-task-readout">{seen.size}/4 connected · {selected.length}/3 links</span></>}
      {kind==='football'&&<><p>Move all three receivers until every passing lane clears the defender. Lines turn green when the path is open. Static geometry; real football is more complicated.</p><svg className="exp-pitch" viewBox="0 0 400 240"><path d="M10 10H390V230H10ZM200 10V230"/><circle cx="200" cy="120" r="42"/>{players.map((y,i)=><g key={i}><line x1="50" y1="120" x2={275+i*30} y2={y} stroke={Math.abs((y-120)*(155/(225+i*30)))>23?'#c9f78b':'#f2a6a0'}/><circle cx={275+i*30} cy={y} r="10" fill="#c9f78b"/></g>)}<circle cx="205" cy="120" r="14" fill="#f2a6a0"/><circle cx="50" cy="120" r="10" fill="#fff"/></svg>{players.map((y,i)=><label key={i}>Receiver {i+1}<input type="range" min="25" max="215" aria-label={`Receiver ${i+1} position`} value={y} onChange={e=>setPlayers(old=>old.map((v,n)=>n===i?+e.target.value:v))}/></label>)}<span className="exp-task-readout">{openLanes}/3 open lanes</span></>}
      {kind==='valves'&&<><p>The ascent needs 5 units of oxygen through two independent valves. Open exactly two valves whose flow adds to 5. This puzzle models arithmetic routing, not a life-support system.</p><div className="exp-valves">{[2,3,5].map((n,i)=><button key={n} onClick={()=>toggle(i)} aria-pressed={selected.includes(i)}><span>{n}</span><small>{selected.includes(i)?'OPEN':'CLOSED'}</small></button>)}</div><span className="exp-task-readout">{selected.reduce((sum,n)=>sum+[2,3,5][n],0)} / 5 flow · {selected.length} / 2 valves</span></>}
      <p role="status" className="exp-task-feedback">{feedback}</p>
      {kind!=='sequence'&&<button className="exp-primary" onClick={()=>correct?setSolved(true):setFeedback('Not quite stable yet. Check the target conditions and try again. No energy lost.')}><Sparkles size={16}/> {kind==='vent'?'Stabilise habitat':kind==='network'?'Test the network':kind==='football'?'Play the pass':'Test oxygen route'}</button>}
    </>}
    {solved&&<div className="exp-discovery-reward"><div className="exp-fragment-trophy">◇</div><span>KNOWLEDGE FRAGMENT RECOVERED</span><h3>{discovery.title}</h3><p>{discovery.fact}</p><a href={discovery.source} target="_blank" rel="noreferrer">Read the source ↗</a><div className="exp-reward-chips"><span>+4 ENERGY</span>{stage===0&&<span>SCAN UPGRADE</span>}</div><button className="exp-primary" onClick={()=>onComplete(discovery.title)}><Check size={17}/> Take the fragment</button></div>}
  </section></div>;
}
