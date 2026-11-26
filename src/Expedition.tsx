import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Check, Compass, Eye, Flag, HelpCircle, Rabbit, Radio, RotateCcw, Share2, Shield, Shuffle, Undo2, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { ability, activeLinks, bargain, challengeURL, dailySeed, chooseUpgrade, guardianWager, threatInterval, upgrades, expeditionScore, makeChart, mirageTarget, moveCost, neighbours, newExpedition, nextThreat, normalSeed, pressingLane, resolveEncounter, travel, type Expedition as Run, type Loadout, type Mode } from './expedition-engine';
import { dailyStreak, descentWorlds, fragmentQuestions, readProfile, writeProfile } from './descent-profile';
import GuardianEncounter from './GuardianEncounter';
import ExpeditionEncounter from './ExpeditionEncounter';
import { sectors } from './thread-engine';
import './thread-game.css';
import './expedition.css';

type RecordEntry = { seed: string; world: string; score: number; moves: number; fragments: number; won: boolean; mode: Mode; loadout: Loadout; hard: boolean; secret: boolean };
function records(): RecordEntry[] { try { const value: unknown = JSON.parse(localStorage.getItem('rh-expedition-records') || '[]'); return Array.isArray(value) ? value.filter((r):r is RecordEntry => !!r && typeof r.seed==='string' && typeof r.world==='string' && Number.isFinite(r.score) && Number.isInteger(r.moves) && Number.isInteger(r.fragments) && typeof r.won==='boolean' && ['challenge','practice'].includes(r.mode) && ['scout','guardian'].includes(r.loadout)).slice(-60) : []; } catch { return []; } }
const worldNames: Record<string,string> = { ocean:'The midnight garden',forest:'The root of everything',dreams:'The unreliable dream',football:'The space between',music:'The lost refrain' };
const threats: Record<string,string> = { ocean:'The lantern leviathan',forest:'The spreading blight',dreams:'The waking shadow',football:'The closing press',music:'The dissonance' };

type Checkpoint = { history: Run[]; score: number; world?: string };
function readCheckpoint(key: string, world?: string): Checkpoint {
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(data?.history) && data.history.length && Number.isFinite(data.score)
      && descentWorlds.includes(data.world) && (!world || data.world === world)
      && data.history.every((run: Run) => run?.world === data.world && Number.isInteger(run.node)
        && run.node >= 0 && run.node < 19 && Array.isArray(run.fragments) && Array.isArray(run.path))) return data;
  } catch { /* Start at the briefing if storage is unavailable. */ }
  return { history: [], score: 0 };
}

export default function Expedition({ world: initialWorld, onHome, onExplore }: { world:string; onHome:()=>void; onExplore:()=>void }) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const [variant] = useState(() => params.get('run') || '');
  const enhanced = variant === 'daily' || variant === 'descent' || variant === 'expedition';
  const chained = variant === 'daily' || variant === 'descent';
  const [profile, setProfile] = useState(readProfile);
  const [seed,setSeed] = useState(()=>normalSeed(params.get('seed') || (variant === 'daily' ? dailySeed() : '') || `DIVE-${Math.random().toString(36).slice(2,8)}`));
  const [mode,setMode] = useState<Mode>(()=>variant!=='daily'&&params.get('mode')==='practice'?'practice':'challenge');
  const [loadout,setLoadout] = useState<Loadout>(()=>variant!=='daily'&&params.get('kit')==='guardian'?'guardian':'scout');
  const [hard,setHard] = useState(()=>variant!=='daily'&&params.get('hard')==='1');
  const checkpointPrefix = `rh-run-v1:${variant}:`;
  const initialKey = `${checkpointPrefix}${chained ? 'chain' : initialWorld}:${seed}:${mode}:${loadout}:${hard}`;
  const [checkpoint] = useState<Checkpoint>(() => enhanced ? readCheckpoint(initialKey, chained ? undefined : initialWorld) : { history: [], score: 0 });
  const [world,setWorld] = useState(checkpoint.world ?? (chained ? 'ocean' : initialWorld));
  const depth = chained ? descentWorlds.indexOf(world) + 1 : 1;
  const checkpointKey = `${checkpointPrefix}${chained ? 'chain' : world}:${seed}:${mode}:${loadout}:${hard}`;
  const [history,setHistory] = useState<Run[]>(checkpoint.history);
  const [chainScore,setChainScore] = useState(checkpoint.score);
  const [tutorial,setTutorial] = useState(false);
  const [guided,setGuided] = useState(false);
  const [impact,setImpact] = useState(0);
  const [archive,setArchive] = useState(records);
  const [sound,setSound] = useState(false), [help,setHelp] = useState(false), [copy,setCopy] = useState(''), [storageError,setStorageError] = useState(false);
  const [hover,setHover] = useState<number|null>(null);
  const modalHeading = useRef<HTMLHeadingElement>(null), audio = useRef<AudioContext|null>(null), savedRun = useRef(checkpoint.history.at(-1)?.status === 'won');
  const chart = makeChart(depth > 1 ? `${depth}-${seed}` : seed), run = history.at(-1), sector = sectors.find(s=>s.id===world) || sectors[0];
  const finished = !!run&&run.status!=='playing', overlay = !!run&&(run.encounter!==null||run.event!==null||run.reward||run.guardian!==undefined||finished)||help||tutorial;
  const guardianUnlocked = profile.worlds.length>0 || archive.some(r=>r.won&&r.mode==='challenge');
  const best = archive.filter(r=>r.seed===seed&&r.world===world&&r.mode===mode&&r.loadout===loadout&&r.hard===hard).reduce((v,r)=>Math.max(v,r.score),0);
  useEffect(() => {
    if (!enhanced) return;
    try {
      if (run && (!finished || chained && run.status === 'won' && depth < descentWorlds.length)) {
        localStorage.setItem(checkpointKey, JSON.stringify({ history: mode === 'practice' ? history : [run], score: chainScore, world }));
      } else localStorage.removeItem(checkpointKey);
    } catch { setStorageError(true); }
  }, [enhanced, run, checkpointKey, chainScore, depth, finished, history, mode, world]);
  useEffect(()=>{ window.history.replaceState(null,'',`${challengeURL(world,seed,hard)}&kit=${loadout}&mode=${mode}&adventure=1${enhanced ? `&run=${variant}` : ''}`); },[world,seed,hard,loadout,mode,enhanced,variant]);
  useEffect(()=>()=>{void audio.current?.close();},[]);
  useEffect(()=>{
    if(overlay) modalHeading.current?.focus();
    else if(run) requestAnimationFrame(()=>document.querySelector<SVGGElement>('.exp-site.current')?.focus({preventScroll:true}));
    if(!overlay)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous;};
  },[overlay,!!run,run?.reward,run?.guardian,finished]);
  useEffect(()=>{
    if(!run||!finished||savedRun.current)return;
    savedRun.current=true;
    if (enhanced && run.status === 'won' && run.mode === 'challenge') {
      setProfile(writeProfile({
        ...profile, worlds: [...new Set([...profile.worlds, world])],
        bestDepth: chained ? Math.max(profile.bestDepth, depth) : profile.bestDepth,
        dailyWins: variant === 'daily' && depth === descentWorlds.length && seed === dailySeed()
          ? [...new Set([...profile.dailyWins, seed])] : profile.dailyWins,
      }));
    }
    const entry: RecordEntry={seed,world,score:expeditionScore(run),moves:run.moves,fragments:run.fragments.length,won:run.status==='won',mode:run.mode,loadout:run.loadout,hard:run.modifier,secret:run.used.includes(14)};
    const next=[...archive,entry].slice(-60);setArchive(next);try{localStorage.setItem('rh-expedition-records',JSON.stringify(next));}catch{setStorageError(true);}
  },[finished]);
  function start(){
    savedRun.current=false;
    const startWorld = chained ? 'ocean' : world;
    if (chained) { setWorld(startWorld); setChainScore(0); }
    setHistory([newExpedition(mode,loadout,hard,enhanced ? startWorld : undefined)]);
    setHover(null);
    window.scrollTo({top:0,behavior:'instant'});
  }
  function continueDescent() {
    if (!run || depth >= descentWorlds.length) return;
    const nextWorld = descentWorlds[depth];
    const next = newExpedition(mode, loadout, hard, nextWorld);
    setChainScore(chainScore + expeditionScore(run));
    setWorld(nextWorld);
    setHistory([{ ...next, energy: run.energy, scan: run.scan, shield: run.shield,
      reroute: run.reroute, freeReroutes: run.freeReroutes, upgrades: run.upgrades }]);
    savedRun.current = false;
    setHover(null);
  }
  function apply(next:Run){if(next===run)return;setHistory(old=>[...old,next]);const hit = !!run && (next.energy < run.energy - 1 || next.broken.length > run.broken.length || /threat caught|current swept/.test(next.message));
    if (hit) setImpact(value => value + 1);
    if(sound)ping(hit || next.status==='lost' ? 150 : next.fragments.length>(run?.fragments.length||0)?660:330);}
  function ping(frequency:number){try{const ctx=audio.current ||= new AudioContext();void ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(frequency,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(frequency*1.5,ctx.currentTime+.16);g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.55);}catch{setSound(false);}}
  async function share(){try{await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${window.location.hash}`);setCopy('Challenge link copied. Same seed, kit, mode, and modifier.');}catch{setCopy(window.location.href);}}
  async function shareResult() {
    if (!run) return;
    const result = `Rabbit Hole · ${sector.world} · ${run.status === 'won' ? 'Escaped' : run.status === 'lost' ? 'Lost' : 'Extracted'}
${'◆'.repeat(run.fragments.length)}${'◇'.repeat(3-run.fragments.length)} · ${run.moves} moves · ${run.energy} energy · ${chainScore + expeditionScore(run)} points${chained ? ` · Depth ${depth}/5` : ''}
${window.location.href}`;
    try { await navigator.clipboard.writeText(result); setCopy('Result copied.'); }
    catch { setCopy(result); }
  }
  function recover(title: string) {
    if (!run) return;
    const id = fragmentQuestions[world]?.[run.fragments.length];
    if (enhanced && id) setProfile(writeProfile({ ...profile, discoveries: [...new Set([...profile.discoveries, id])] }));
    apply(resolveEncounter(run,chart,title));
  }
  function undo(){
    if(run?.mode!=='practice'||history.length<2||run.encounter!==null||run.event!==null)return;
    const previous=history.map((state,index)=>index<history.length-1&&state.encounter===null&&state.event===null&&!state.reward&&state.guardian===undefined&&(finished||state.moves<run.moves)).lastIndexOf(true);
    if(previous<0)return;if(finished)savedRun.current=false;setHistory(old=>old.slice(0,previous+1));
  }
  function leaveEncounter(){if(!run)return;apply({...run,encounter:null,message:'You left the fragment in place. Return to this site when you’re ready.'});}
  const labels = { fragment:'◇', cache:'ϟ', hazard:'!', bargain:'?', secret:'✳', exit:'↗', junction:'·', start:'◉' };
  const blocked = run ? pressingLane(chart, run) : -1;
  const options=run?neighbours(chart,run).filter(id=>id!==blocked):[];
  const dangerNode=run && run.threat>=0 ? (run.moves+1)%threatInterval(run)===0 ? nextThreat(chart,run) : run.threat : -1;
  const mirage = run ? mirageTarget(chart, run) : -1;
  const preview=run&&hover!==null?chart.nodes[hover]:null;
  function trap(e:React.KeyboardEvent<HTMLElement>){if(e.key!=='Tab')return;const els=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href],select'));const first=els[0],last=els.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===modalHeading.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  return <div className={`thread-game expedition world-${world} ${profile.skin === 'starlight' ? 'pip-starlight' : ''} ${run?.phase==='escape'?'is-escaping':''}`} style={{'--thread-accent':sector.color} as CSSProperties}>
    <div inert={overlay}>
      <header className="thread-header"><button className="thread-brand" onClick={onHome}><Rabbit size={30}/> rabbit hole<sup>EXPEDITIONS</sup></button><span className="thread-edition">RECOVER SOMETHING WORTH COMING BACK FOR.</span><button onClick={onExplore}>Discovery archive <ArrowUpRight size={14}/></button></header>
      <main className="exp-shell">
        <div className="exp-heading"><div><span className="thread-eyebrow">THREAD / AN ADVENTURE IN CONNECTIONS</span><h1>{world==='ocean'?'Into the ':world==='forest'?'Beneath the ':world==='dreams'?'Beyond the ':world==='football'?'Read the ':'Follow the '}<em>{world==='ocean'?'unknown.':world==='forest'?'roots.':world==='dreams'?'waking.':world==='football'?'space.':'refrain.'}</em></h1></div><div className="exp-heading-actions"><button onClick={()=>setSound(!sound)} aria-label={sound?'Mute expedition sound':'Enable expedition sound'} aria-pressed={sound}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button onClick={share}><Share2 size={14}/> Challenge a friend</button>{run&&<button onClick={()=>setHelp(true)} aria-label="Expedition help"><HelpCircle size={17}/></button>}</div></div>
        {!chained&&<nav className="exp-world-tabs" aria-label="Expedition worlds">{sectors.map(s=><button key={s.id} aria-current={s.id===world?'page':undefined} onClick={()=>{if(s.id!==world){setWorld(s.id);setHover(null);setHistory([]);savedRun.current=false;}}}>{s.world}{archive.some(r=>r.world===s.id&&r.won)&&<Check size={12}/>}</button>)}</nav>}
        {copy&&<div className="exp-copy" role="status">{copy}<button onClick={()=>setCopy('')} aria-label="Dismiss share message"><X size={13}/></button></div>}
        {!run?<section className="exp-briefing">
          <div className="exp-briefing-art"><div className="exp-depth-lines"/><div className="exp-jelly"><i/><i/><i/><i/><b/></div><div className="exp-creature-silhouette"/><span className="exp-art-coordinate">35° 42′ N / THE UNCHARTED WEB</span><div className="exp-briefing-title"><span>EXPEDITION 01 / {sector.world.toUpperCase()}</span><h2>{worldNames[world]}</h2><p>Three fragments. A living web.<br/>Something that would rather you stayed.</p></div></div>
          <div className="exp-launch-panel"><span className="thread-eyebrow">MISSION BRIEF</span><h2>Go curious.<br/><em>Come back changed.</em></h2><p>Explore the web. Solve field encounters to recover <strong>three knowledge fragments</strong>. Manage your energy, avoid the pursuer, and make it to the ascent.</p><ol><li><Compass size={17}/><span>Every thread is a decision.<small>Hazards cost 3 energy. Air pockets restore 5.</small></span></li><li><Eye size={17}/><span>Curiosity has advantages.<small>Scan hidden paths. Shield a hit. Reroute a thread.</small></span></li><li><Flag size={17}/><span>The last fragment wakes the finale.<small>Seven moves to escape. Five in Deep Dive.</small></span></li></ol>
          {variant!=='daily'&&<div className="exp-mode-switch"><button aria-pressed={mode==='challenge'} onClick={()=>setMode('challenge')}>Expedition<small>Consequences. No undo.</small></button><button aria-pressed={mode==='practice'} onClick={()=>setMode('practice')}>Practice<small>Same rules. Unlimited undo.</small></button></div>}
          {variant!=='daily'&&<><label className="exp-seed-label">CHALLENGE CODE<input aria-label="Challenge code" value={seed} maxLength={24} onChange={e=>setSeed(normalSeed(e.target.value))}/></label><div className="exp-seed-actions"><button onClick={()=>setSeed(normalSeed(`DIVE-${Math.random().toString(36).slice(2,8)}`))}><Shuffle size={12}/> New chart</button><button onClick={()=>{setSeed(dailySeed());setMode('challenge');setLoadout('scout');setHard(false);}}><Radio size={12}/> Daily dive · Paris</button></div>
          <div className="exp-loadout"><label>Starting kit<select aria-label="Starting kit" value={loadout} onChange={e=>setLoadout(e.target.value as Loadout)}><option value="scout">Scout · 3 Scans / 1 Shield</option><option value="guardian" disabled={!guardianUnlocked&&mode!=='practice'&&params.get('kit')!=='guardian'}>Guardian · 2 Scans / 2 Shields{guardianUnlocked||mode==='practice'?'':' · win to unlock'}</option></select></label><label className="exp-hard"><input type="checkbox" checked={hard} onChange={e=>setHard(e.target.checked)}/> Deep Dive <span>22 energy · 5-move escape</span></label></div></>}
          <button className="exp-primary exp-launch" onClick={start}>Begin expedition <ArrowUpRight size={19}/></button> {enhanced&&<div className="exp-briefing-actions"><button onClick={()=>setTutorial(true)}>Learn in 30 seconds</button>{!chained&&<a href={`#play/ocean?run=descent`} onClick={e=>{e.preventDefault();window.history.replaceState(null,'',e.currentTarget.href);window.location.reload();}}>Play five-world Descent</a>}</div>}<small className="exp-launch-note">Threats advance when you move.{best>0?` Your best for these rules: ${best}.`:''}</small></div>
        </section>:<div className="exp-game-layout">
          <section className="exp-board" aria-label="Expedition playing field">
            <div className="exp-board-hud"><span><i/> {chained&&`DEPTH ${depth}/5 · `}{run.phase==='escape'?'FINAL ASCENT':worldNames[world].toUpperCase()}</span><strong><Zap size={15}/>{run.energy}<small>ENERGY</small></strong><strong>◇ {run.fragments.length}/3<small>FRAGMENTS</small></strong>{run.phase==='escape'&&<strong className="exp-danger">{run.escape}<small>MOVES TO ESCAPE</small></strong>}</div>
            <div className="exp-atmosphere" aria-hidden="true"><div className="exp-jelly"><i/><i/><i/><i/><b/></div><div className="exp-creature-silhouette"/></div>
            <svg key={impact} viewBox="0 0 700 640" className={`exp-web ${impact ? 'exp-impact' : ''}`} role="group" aria-label="Expedition map">
              <defs><radialGradient id="exp-glow"><stop stopColor={sector.color} stopOpacity=".14"/><stop offset="1" stopColor={sector.color} stopOpacity="0"/></radialGradient><filter id="exp-soft"><feGaussianBlur stdDeviation="4"/></filter></defs><circle cx="350" cy="320" r="310" fill="url(#exp-glow)"/>
              {[90,128,195,262,300].map(r=><circle key={r} cx="350" cy="320" r={r} className="exp-map-ring"/>)}
              {run.broken.map(([a,b],i)=><line key={`broken-${i}`} x1={chart.nodes[a].x} y1={chart.nodes[a].y} x2={chart.nodes[b].x} y2={chart.nodes[b].y} className="exp-broken-link"/>)}
              {activeLinks(chart,run).map(([a,b],i)=><line key={i} x1={chart.nodes[a].x} y1={chart.nodes[a].y} x2={chart.nodes[b].x} y2={chart.nodes[b].y} className={`exp-map-link ${(a===run.node&&options.includes(b))||(b===run.node&&options.includes(a))?'lit':''} ${run.extra.some(([x,y])=>x===a&&y===b)?'new-thread':''}`}/>)}
              {chart.nodes.filter(n=>n.id!==14||run.revealed.includes(14)).map(n=>{const current=n.id===run.node,visited=run.visited.includes(n.id),fragment=run.fragments.includes(n.id),available=options.includes(n.id),used=run.used.includes(n.id);return <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={`exp-site kind-${n.kind} ${available?'available':''} ${current?'current':''} ${fragment?'collected':''} ${used?'used':''} ${n.id===blocked||available&&(n.id===dangerNode||n.id===mirage&&run.revealed.includes(n.id))?'threatened':''}`} role="button" tabIndex={0} aria-label={`${n.name}, ${current?'your position':fragment?'fragment recovered':n.kind}, node ${n.id}`} aria-disabled={!available||finished} onMouseEnter={()=>setHover(n.id)} onFocus={()=>setHover(n.id)} onMouseLeave={()=>setHover(null)} onClick={()=>available&&apply(travel(chart,run,n.id))} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(available)apply(travel(chart,run,n.id));}}}><circle r="28" fill="transparent"/>{(n.kind==='fragment'||n.kind==='exit')&&<circle r="25" className="exp-site-ring"/>}{current&&<circle r="31" className="exp-current-halo"/>}<circle r={n.kind==='fragment'?18:15} className="exp-site-body"/><text y="5" textAnchor="middle" className="exp-site-icon">{current?'':fragment?'✓':used?'·':labels[n.kind]}</text><text y="39" textAnchor="middle" className="exp-site-label">{current?'YOU':n.id===blocked?'BLOCKED':n.kind==='fragment'?fragment?'RECOVERED':'FRAGMENT':n.kind==='exit'?'ASCENT':n.kind==='cache'&&!used?'+5 ENERGY':n.kind==='hazard'?'−3 ENERGY':enhanced&&n.id===6&&!used?'GUARDIAN':n.kind==='bargain'&&!used?'BARGAIN':n.kind==='secret'?'SECRET':visited?'MAPPED':''}</text></g>;})}
              {run.threat>=0&&<><line x1={chart.nodes[run.threat].x} y1={chart.nodes[run.threat].y} x2={chart.nodes[nextThreat(chart,run)].x} y2={chart.nodes[nextThreat(chart,run)].y} className="exp-threat-path"/><g className="exp-pursuer" style={{transform:`translate(${chart.nodes[run.threat].x}px,${chart.nodes[run.threat].y}px)`}} aria-label={`${threats[world]} at node ${run.threat}`}><ellipse rx="29" ry="12"/><path d="M-22 0L-40-15L-34 0L-40 15Z"/><circle cx="12" cy="-2" r="3"/><text y="-28" textAnchor="middle">DANGER</text></g></>}
              <g className="exp-player" style={{transform:`translate(${chart.nodes[run.node].x}px,${chart.nodes[run.node].y}px)`}} aria-hidden="true"><circle r="13" fill={sector.color} opacity=".6" filter="url(#exp-soft)"/><circle r="6" fill="#effffa"/>{run.armed&&<circle r="22" className="exp-shield-ring"/>}</g>
            </svg>
            {guided&&run.moves<3&&<div className="exp-guidance"><p>{['Pick any glowing neighbour. A normal move costs one energy.', 'Try a diamond site, or stop at an air pocket to refill.', 'Keep going until you have three fragments. Then follow the marked ascent.'][run.moves]}</p><button onClick={()=>setGuided(false)}>Skip guidance</button></div>}
            <div className="exp-site-preview">{preview?<><strong>{preview.name}</strong><span>{preview.id===run.node?'Your current position':preview.id===blocked?'The defender is blocking this lane. Use another thread or arm Shield.':options.includes(preview.id)?`Move cost: ${preview.id===mirage&&!run.revealed.includes(preview.id)?1:moveCost(chart,run,preview.id)} energy${preview.id===mirage&&run.revealed.includes(preview.id)?' · false trail':''}${preview.kind==='cache'&&!run.used.includes(preview.id)?' · gain 5 on arrival':''}`:'Follow connected threads to reach this site.'}</span></>:<><strong>{run.phase==='escape'?'The web is coming apart.':'Choose a glowing thread.'}</strong><span>{run.phase==='escape'?'Reach the ascent. Reroute can open a direct escape.':'Recover three fragments through field encounters, then escape.'}</span></>}</div>
            <div className="exp-ability-bar">{([{id:'scan',Icon:Eye,name:'Scan',detail:'Reveal paths'},{id:'shield',Icon:Shield,name:'Shield',detail:run.armed?'ARMED':'Block one hit'},{id:'reroute',Icon:Shuffle,name:'Reroute',detail:run.freeReroutes?'New link · free':'New link · −2 energy'}] as const).map(({id,Icon,name,detail})=><button key={id} onClick={()=>apply(ability(chart,run,id))} disabled={!run[id]||id==='shield'&&run.armed||id==='reroute'&&run.energy<=(run.freeReroutes?0:2)||finished} aria-label={`${name} ability, ${run[id]} charges`}><Icon size={18}/><span>{name}<small>{detail}</small></span><b>{run[id]}</b></button>)}</div>
          </section>
          <aside className="exp-sidebar"><div className="exp-pip"><Rabbit size={25}/><div><strong>PIP / YOUR QUESTIONABLE GUIDE</strong><p key={run.message} role="status">{run.message}</p></div></div>
            <div className="exp-objectives"><span className="thread-eyebrow">BRING BACK THE UNKNOWN</span>{[0,1,2].map(i=><div className={i<run.fragments.length?'done':''} key={i}><span>{i<run.fragments.length?<Check size={17}/>:<span>◇</span>}</span><p>{run.discoveries[i]||`Knowledge fragment 0${i+1}`}<small>{i<run.fragments.length?'RECOVERED':i===run.fragments.length?'SEEK A DIAMOND SITE':'UNEXPLORED'}</small></p></div>)}</div>
            <div className={`exp-threat-panel ${run.threat>=0?'awake':''}`}><span className="thread-eyebrow">{run.phase==='escape'?'THE WEB IS COLLAPSING':'THREAT TELEMETRY'}</span><strong>{run.threat>=0?threats[world]:'Something is sleeping.'}</strong><p>{run.threat>=0?`Moves in ${threatInterval(run)-run.moves%threatInterval(run)} step${threatInterval(run)-run.moves%threatInterval(run)===1?'':'s'}. Its next route is marked red. Contact costs ${world==='forest'&&enhanced?2:world==='football'&&enhanced?3:4} energy; Shield blocks it.`:'Recover your first fragment to wake the threat. It advances on your turns.'}</p>{enhanced&&<p>{{
              ocean:'On surge turns, hazards can sweep you to a nearby junction. Shield anchors you.',
              forest:'Every third move, growth can seal the route you just used.',
              dreams:'Every third move can hide a false trail. Scan exposes it.',
              football:'The defender blocks a lane on press turns. Shield lets you push through.',
              music:'The pursuit beat changes as you collect fragments.',
            }[world]}</p>}</div>
            <div className="exp-run-stats"><span><strong>{run.moves}</strong>MOVES</span><span><strong>{chainScore+expeditionScore(run)}</strong>SCORE</span><span><strong>{run.mode==='practice'?'∞':'0'}</strong>UNDOS</span></div>
            {run.fragments.length>0&&<div className="exp-upgrade"><Zap size={14}/><span>RECOVERY LENS ACTIVE<small>Scan turns newly revealed sites into energy.</small></span></div>}
            <div className="exp-side-actions">{run.mode==='practice'&&<button onClick={undo} disabled={history.length<2 || !!run.reward || run.guardian!==undefined}><Undo2 size={14}/> Undo</button>}<button onClick={()=>{setHistory([]);savedRun.current=false;}}><RotateCcw size={14}/> New expedition</button>{run.fragments.length>0&&run.node===18&&<button onClick={()=>apply({...run,status:'extracted',cause:'You chose to leave early with the fragments already recovered.'})}><Flag size={14}/> Extract with {run.fragments.length} fragments</button>}</div><small className="exp-run-code">{seed} / {mode.toUpperCase()} / {loadout.toUpperCase()}{hard?' / DEEP DIVE':''}</small>
          </aside>
        </div>}
        {!run&&<div className="exp-mastery"><div><span className="thread-eyebrow">EXPEDITION LOG</span><strong>{archive.filter(r=>r.won&&r.mode==='challenge').length} successful expeditions</strong></div><span className={guardianUnlocked?'earned':''}>◈ First light <small>{guardianUnlocked?'Guardian kit unlocked':'Win an expedition'}</small></span><span className={archive.some(r=>r.won&&r.secret)?'earned':''}>✳ Secret keeper <small>Escape after finding the hidden garden</small></span><span className={archive.some(r=>r.won&&r.hard&&r.mode==='challenge')?'earned':''}>ϟ Into the abyss <small>Complete a Deep Dive expedition</small></span></div>}
        {!run&&enhanced&&<section className="exp-profile" aria-label="Expedition profile"><h2>Field journal</h2><p>{profile.worlds.length}/5 worlds cleared · {profile.discoveries.length}/15 discoveries · Best depth {profile.bestDepth} · {dailyStreak(profile)} day streak</p><p>{sectors.filter(s=>profile.worlds.includes(s.id)).map(s=>`${s.world} Pathfinder`).join(' · ')}</p>{profile.bestDepth>=2&&<label>Pip’s outfit <select value={profile.skin ?? ''} onChange={e=>setProfile(writeProfile({...profile,skin:e.target.value==='starlight'?'starlight':undefined}))}><option value="">Field kit</option><option value="starlight">Starlight</option></select></label>}</section>}
        {storageError&&<p role="status" className="exp-storage">Browser storage is unavailable. This run works; its record will last for this visit.</p>}
      </main>
    </div>
    {run?.encounter!==null&&run?.encounter!==undefined&&<ExpeditionEncounter key={run.encounter} world={world} stage={run.fragments.length} seed={seed} sound={sound} onLeave={leaveEncounter} enhanced={enhanced} onComplete={recover}/>}
    {run?.event!==null&&run?.event!==undefined&&<div className="exp-modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="bargain-title" className="exp-encounter" onKeyDown={trap}><span className="thread-eyebrow">CURATED EVENT / {run.event===4?'THE SALVAGE MERCHANT':'THE STRANDED SURVEY PROBE'}</span><h2 id="bargain-title" ref={modalHeading} tabIndex={-1}>{run.event===4?<>“I found this.<br/>It’s probably safe.”</>:<>One signal.<br/>Two bad ideas.</>}</h2><p>{run.event===4?'A strange little radio crackles to life. Every offer has a cost. Pick one—or keep what you have.':'A survey probe is caught in the web. Repair its routing relay, harvest its noisy battery, or leave it to the dark. Pip insists it is not a relative.'}</p><div className="exp-bargain-options"><button disabled={run.energy<=2} onClick={()=>apply(bargain(run,'shield'))}><Shield size={20}/><strong>{run.event===4?'Buy a protective shell':'Repair the navigation relay'}</strong><span>−2 energy · +1 {run.event===4?'Shield':'Reroute'} charge</span></button><button onClick={()=>apply(bargain(run,'energy'))}><Zap size={20}/><strong>Take the noisy battery</strong><span>+3 energy · moves the threat to node 6</span></button><button onClick={()=>apply(bargain(run,'leave'))}><Compass size={20}/><strong>Leave it alone</strong><span>No cost. No reward. A perfectly good decision.</span></button></div></section></div>}
    {(run?.reward || run?.guardian !== undefined || tutorial)&&<div className="exp-modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="exp-choice-title" className="exp-encounter" onKeyDown={trap}>
      <h2 id="exp-choice-title" ref={modalHeading} tabIndex={-1}>{tutorial?'Your first three moves':run?.reward?'Choose a field upgrade':'Guardian wager'}</h2>
      {tutorial ? <><ol><li>Follow a glowing thread. Each move spends energy.</li><li>Land on a diamond and solve its encounter to get a fragment.</li><li>After three fragments, reach the ascent before your remaining moves run out.</li></ol><button className="exp-primary" onClick={()=>{setTutorial(false);setGuided(true);start();}}>Begin expedition</button><button onClick={()=>setTutorial(false)}>Back to briefing</button></>
        : run?.reward ? <div className="exp-bargain-options">{upgrades.map(upgrade=><button key={upgrade} onClick={()=>apply(chooseUpgrade(run,upgrade))}>{upgrade}</button>)}</div>
        : run && <GuardianEncounter world={world} seed={seed} energy={run.energy} onFinish={result=>apply(guardianWager(run,result))}/>}
    </section></div>}
    {finished&&run&&<div className="exp-modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="exp-result-title" className={`exp-encounter exp-end ${run.status==='won'?'victory':''}`} onKeyDown={trap}><span className="exp-end-symbol">{run.status==='won'?'✳':run.status==='extracted'?'◇':'↺'}</span><span className="thread-eyebrow">{run.status==='won'?run.used.includes(14)?'SECRET ENDING / THE GARDEN REMEMBERS':'EXPEDITION COMPLETE':run.status==='extracted'?'A WISE RETREAT':'EXPEDITION LOST'}</span><h2 id="exp-result-title" ref={modalHeading} tabIndex={-1}>{run.status==='won'?'You brought the light back.':run.status==='extracted'?'Some things are worth saving.':'The deep keeps its secrets.'}</h2><p>{run.status==='won'?'Three discoveries. A route that only you took. Pip is already asking what’s over the next ridge.':run.cause}</p><div className="exp-end-stats"><span><strong>{chainScore+expeditionScore(run)}</strong>SCORE</span><span><strong>{run.fragments.length}/3</strong>FRAGMENTS</span><span><strong>{run.moves}</strong>MOVES</span><span><strong>{run.energy}</strong>ENERGY</span></div> {run.path&&<details className="exp-recap"><summary>Route and upgrades</summary><p>{run.path.map(id=>chart.nodes[id].name).join(' → ')}</p><p>{run.upgrades?.join(', ') || 'No upgrades collected'}</p></details>}<div className="exp-end-discoveries">{run.discoveries.map(d=><span key={d}>◇ {d}</span>)}</div><p className="exp-result-note">{run.status==='lost'?`You recovered ${run.fragments.length} fragments before the final decision. The same chart is waiting; try a different route or practice with undo.`:`Best score for this code and rules: ${Math.max(best,expeditionScore(run))}. ${run.mode==='practice'?'Practice results stay separate from expedition records.':guardianUnlocked?'Guardian kit available for your next dive.':''}`}</p> {chained&&run.status==='won'&&depth<descentWorlds.length&&<button className="exp-primary" onClick={continueDescent}>Descend to {sectors.find(s=>s.id===descentWorlds[depth])?.world} <ArrowUpRight size={16}/></button>}<button className="exp-primary" onClick={start}>{run.status==='won'?'Replay this expedition':'Retry this expedition'} <RotateCcw size={16}/></button><div className="exp-end-actions">{run.mode==='practice'&&run.status==='lost'&&<button onClick={undo}><Undo2 size={14}/> Undo fatal move</button>}<button onClick={()=>{setHistory([]);savedRun.current=false;}}>Change route / kit</button><button onClick={shareResult}><Share2 size={14}/> Copy result</button><button onClick={share}><Share2 size={14}/> Share this challenge</button></div>{copy&&<p role="status">{copy}</p>}</section></div>}
    {help&&<div className="exp-modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="exp-help-title" className="exp-encounter" onKeyDown={trap}><h2 id="exp-help-title" ref={modalHeading} tabIndex={-1}>A few things Pip forgot.</h2><p>Move only along glowing threads. Hover, focus, or tap a site to inspect it. Each move costs 1 energy; hazards cost 3 unless Shield is armed. Air pockets restore 5 once.</p><p>Diamond sites hold playable encounters and sourced discoveries. Complete three, then reach the ascent in 7 moves (5 in Deep Dive). The creature moves every third turn, not in real time. Red lines predict its route; contact costs 4 energy.</p><p>Scan reveals hidden routes. After your first fragment it also restores energy for newly revealed sites. Shield prevents one hit. Reroute costs 2 energy and opens a useful direct thread. All have limited charges.</p><p>Practice allows undo, including failure. Expedition does not. Daily challenges use the Paris calendar. Links include the seed and rules so friends play independently.</p><button className="exp-primary" onClick={()=>setHelp(false)}>Back to the expedition <Check size={16}/></button></section></div>}
  </div>;
}
