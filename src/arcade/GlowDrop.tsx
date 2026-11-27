import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Diamond,
  Dices,
  Flag,
  Leaf,
  Music2,
  Pause,
  Play,
  Rabbit,
  RotateCcw,
  Share2,
  SkipForward,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { dailySeed } from '../expedition-engine';
import { allIdeas } from '../data';
import { fragmentQuestions, readProfile, writeProfile } from '../descent-profile';
import { questionById, type World } from '../questions';
import GlowBoard, { type Flight } from './GlowBoard';
import {
  clampAngle,
  countBeacons,
  createBoard,
  MAX_ANGLE,
  newRun,
  nextBoard,
  retryBoard,
  settleDrop,
  traceDrop,
  worlds,
  type Run,
  type ShotEvent,
} from './glow-engine';
import { playTone } from './glow-audio';
import {
  freshSeed,
  openSession,
  runHash,
  saveSession,
  sessionFromHash,
  type Mode,
  type Session,
} from './glow-storage';
import './glow.css';

const cover = new URL('./glow-drop.webp', import.meta.url).href;
const worldIcons = [Waves, Leaf, Brain, Flag, Music2];
const scoreText = (score: number) => score.toLocaleString();
const angleText = (degrees: number) =>
  degrees === 0 ? 'Straight' : `${Math.abs(degrees)}° ${degrees < 0 ? 'left' : 'right'}`;
const editionDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function GlowDrop({
  onJournal,
}: {
  onJournal: (world: World, returnHash: string) => void;
}) {
  const [session, setSession] = useState(() => sessionFromHash(location.hash));
  const initial = useRef(session);
  const { run, mode } = session;
  const board = useMemo(() => createBoard(run.seed, run.depth), [run.seed, run.depth]);
  const world = worlds[run.depth];
  const WorldIcon = worldIcons[run.depth];
  const [angle, setAngle] = useState(board.initialAngle);
  const [flight, setFlight] = useState<Flight | null>(null);
  const flightLock = useRef<Flight | null>(null);
  const [paused, setPaused] = useState(false);
  const [earned, setEarned] = useState(0);
  const [flightLights, setFlightLights] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shareText, setShareText] = useState('');
  const [saved, setSaved] = useState(true);
  const [sound, setSound] = useState(() => {
    try {
      return localStorage.getItem('rh-glow-sound') === 'on';
    } catch {
      return false;
    }
  });
  const audio = useRef<AudioContext | null>(null);
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const action = useRef<HTMLButtonElement>(null);
  const outcome = useRef<HTMLHeadingElement>(null);
  const [help, setHelp] = useState(false);
  const view = flight?.from ?? run;
  const lit = flight ? flightLights : run.lit;
  const ready = !flight && !help && run.phase === 'aim';
  const result = !flight && run.phase !== 'aim';
  const displayScore = flight ? view.score + earned : run.score;
  const fieldNotes = fragmentQuestions[world.id].filter((_, i) => lit & (1 << i));

  const latestNote = questionById.get(fieldNotes.at(-1) ?? '');
  const evidence = latestNote && allIdeas.find((entry) => entry.idea.id === latestNote.idea)?.idea;

  useEffect(() => {
    const starting = initial.current;
    if (starting.mode === 'free' || location.hash.includes('?')) {
      history.replaceState(null, '', runHash(starting));
    }
    const previous = document.title;
    document.title = 'Glow Drop · Rabbit Hole Arcade';
    return () => {
      document.title = previous;
      if (audio.current) void audio.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (result) outcome.current?.focus({ preventScroll: true });
  }, [result]);

  function commit(next: Session) {
    const status = saveSession(next);
    setSaved(status.saved);
    setSession({ ...next, best: status.best });
  }

  function activate(next: Session) {
    flightLock.current = null;
    setFlight(null);
    setPaused(false);
    setFeedback('');
    setShareText('');
    setAngle(createBoard(next.run.seed, next.run.depth).initialAngle);
    commit(next);
    history.replaceState(null, '', runHash(next));
  }

  function changeMode(next: Mode, seed?: string) {
    if (!seed && mode === next) return;
    activate(openSession(next, seed));
  }

  function getAudio() {
    if (!audio.current && typeof AudioContext !== 'undefined') {
      try {
        audio.current = new AudioContext();
      } catch {
        return null;
      }
    }
    if (audio.current?.state === 'suspended') void audio.current.resume().catch(() => {});
    return audio.current;
  }

  function toggleSound() {
    const enabled = !sound;
    if (enabled) {
      const context = getAudio();
      if (context) playTone(context, 'beacon');
    }
    setSound(enabled);
    try {
      localStorage.setItem('rh-glow-sound', enabled ? 'on' : 'off');
    } catch {
      /* The switch still works for this visit. */
    }
  }

  function drop(degrees: number) {
    if (!ready || flightLock.current) return;
    const shot = traceDrop(board, degrees, run.lit, run.multiplier);
    const current = { from: run, angle: degrees, shot };
    flightLock.current = current;
    setAngle(degrees);
    setFlight(current);
    setEarned(0);
    setFlightLights(run.lit);
    setPaused(false);
    setFeedback('');
    setShareText('');
    if (sound) {
      const context = getAudio();
      if (context) playTone(context, 'drop');
    }
    const next = settleDrop(run, shot);
    // Store the landing immediately, so closing the tab during a shot never
    // consumes a spark without recording its beacons and score.
    const best =
      next.phase === 'won' || next.phase === 'lost' ? Math.max(session.best, next.score) : session.best;
    commit({ ...session, run: next, best });
    if (shot.lit !== run.lit) {
      const profile = readProfile();
      const found = fragmentQuestions[world.id].filter((_, i) => shot.lit & (1 << i));
      writeProfile({ ...profile, discoveries: [...new Set([...profile.discoveries, ...found])] });
    }
  }

  function aimHint() {
    // Search outwards from the player's aim for the nearest scoring line.
    for (let offset = 0; offset <= MAX_ANGLE * 2; offset++) {
      for (const direction of offset ? [-1, 1] : [1]) {
        const candidate = angle + offset * direction;
        if (Math.abs(candidate) > MAX_ANGLE || !traceDrop(board, candidate, run.lit).chain) continue;
        setAngle(candidate);
        setFeedback(
          `Pip found a line to a gold beacon. Aim set to ${angleText(candidate).toLowerCase()}.`,
        );
        action.current?.focus({ preventScroll: true });
        return;
      }
    }
  }

  function onEvent(event: ShotEvent) {
    if (sound && audio.current) playTone(audio.current, event.kind, event.chain);
    if (event.kind === 'beacon' && event.beacon !== undefined) {
      const bit = 1 << event.beacon;
      setFlightLights((mask) => mask | bit);
      setEarned((value) => value + event.points);
    }
  }

  function finish() {
    const current = flightLock.current;
    if (!current) return;
    flightLock.current = null;
    const { shot } = current;
    const hits =
      shot.chain === 0
        ? 'No new beacons. Try another angle.'
        : shot.chain === 1
          ? `Beacon lit! +${scoreText(shot.points)}.`
          : `${shot.chain}-beacon combo! +${scoreText(shot.points)}.`;
    setFeedback(hits + (shot.caught ? ' The scoop saved your spark.' : ''));
    setFlight(null);
    setPaused(false);
  }

  function continueRun(next: Run) {
    activate({ ...session, run: next });
    requestAnimationFrame(() => action.current?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target;
      if (
        !ready ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        !(target instanceof HTMLElement) ||
        target.closest('input, textarea, button, a, summary, dialog, [contenteditable="true"]')
      )
        return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        setAngle((value) =>
          clampAngle(value + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 5 : 1)),
        );
      } else if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) drop(angle);
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  });

  function showHelp() {
    dialog.current?.showModal();
    setHelp(true);
  }

  async function share() {
    const outcome = run.phase === 'won' ? 'All five worlds lit' : `World ${run.depth + 1}/5`;
    const message = `Glow Drop · ${outcome} · ${scoreText(run.score)} points · ${run.drops} drops${run.retries ? ` · ${run.retries} retries` : ''}\n${location.origin}${location.pathname}${runHash(session)}`;
    try {
      await navigator.clipboard.writeText(message);
      setFeedback('Result and challenge link copied.');
      setShareText('');
    } catch {
      setShareText(message);
    }
  }

  const modeDate =
    mode === 'daily' ? editionDate.format(new Date(run.seed.slice(6) + 'T12:00:00Z')) : '';
  return (
    <div className="glow-app" style={{ '--board-accent': world.accent } as CSSProperties}>
      <header className="glow-nav">
        <div className="glow-nav-inner">
          <a className="glow-brand" href="#glow" aria-label="Rabbit Hole arcade home">
            <span className="glow-logo">
              <Rabbit size={24} strokeWidth={2.3} />
            </span>
            Rabbit Hole<span className="glow-brand-dot">.</span>
          </a>
          <nav aria-label="Game navigation">
            <span className="glow-nav-active" aria-current="page">
              Arcade
            </span>
            <a href="#observatory">
              Expeditions <ArrowUpRight size={13} />
            </a>
          </nav>
          <div className="glow-nav-tools">
            <button type="button" onClick={showHelp} aria-label="How to play">
              <CircleHelp size={17} />
              <span>How to play</span>
            </button>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={sound ? 'Mute sound' : 'Enable sound'}
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
          </div>
        </div>
      </header>
      <main className="glow-layout">
        <section className="glow-intro" aria-labelledby="glow-title">
          <div className="glow-poster">
            <img
              src={cover}
              fetchPriority="high"
              alt="Pip in a brass diving helmet, reaching for a golden pearl in the deep sea"
            />
            <div className="glow-poster-copy">
              <span className="glow-edition">
                {mode === 'daily' ? <CalendarDays size={14} /> : <Dices size={15} />}{' '}
                {mode === 'daily' ? `Daily challenge · ${modeDate}` : 'Free play'}
              </span>
              <h1 id="glow-title">
                Glow <em>Drop</em>
              </h1>
            </div>
          </div>
          <p className="glow-rules">
            Bank a spark into all three gold beacons. Light up five worlds to bring Pip home.
          </p>
          <div className="glow-modes" role="group" aria-label="Game mode">
            <button aria-pressed={mode === 'daily'} onClick={() => changeMode('daily')}>
              <CalendarDays size={16} /> Daily challenge
            </button>
            <button aria-pressed={mode === 'free'} onClick={() => changeMode('free')}>
              <Dices size={17} /> Free play
            </button>
          </div>
          {mode === 'daily' && run.seed !== dailySeed() && (
            <button className="glow-text" onClick={() => changeMode('daily', dailySeed())}>
              Play today’s board <ArrowRight size={14} />
            </button>
          )}
          {mode === 'free' && (
            <button className="glow-text" onClick={() => changeMode('free', freshSeed())}>
              <Dices size={14} /> Shuffle a new chart
            </button>
          )}
        </section>
        <section className="glow-cabinet" aria-labelledby="glow-board-name">
          <header className="glow-board-head">
            <div>
              <span className="glow-board-label">
                <WorldIcon size={15} /> {world.name} <i /> World {run.depth + 1} of 5
              </span>
              <h2 id="glow-board-name">{world.board}</h2>
            </div>
            <div className="glow-score">
              <span>Score</span>
              <strong data-testid="glow-score">{scoreText(displayScore)}</strong>
            </div>
          </header>
          <div className="glow-hud">
            <div aria-label={`${view.sparks - Number(Boolean(flight))} sparks left`}>
              <span className="glow-reserve" aria-hidden="true">
                {Array.from({ length: view.multiplier === 2 ? 3 : 5 }, (_, i) => (
                  <i key={i} className={i < view.sparks - Number(Boolean(flight)) ? 'full' : ''} />
                ))}
              </span>
              <span>Sparks</span>
            </div>
            <div className="glow-lights">
              <Diamond size={13} />
              <strong>{countBeacons(lit)}/3</strong> Beacons
            </div>
            {view.multiplier === 2 && <b className="glow-double">2× points</b>}
          </div>
          <div className="glow-well">
            <GlowBoard
              board={board}
              angle={angle}
              lit={view.lit}
              flight={flight}
              ready={ready}
              paused={paused || help}
              reduced={reduced}
              onAim={setAngle}
              onDrop={drop}
              onFinish={finish}
              onEvent={onEvent}
            />
            {paused && !help && (
              <div className="glow-overlay">
                <div className="glow-outcome">
                  <Pause size={24} />
                  <h3>Drop paused</h3>
                  <button className="glow-primary" onClick={() => setPaused(false)}>
                    <Play size={16} /> Resume drop
                  </button>
                </div>
              </div>
            )}
            {result && (
              <div className="glow-overlay">
                <div className="glow-outcome">
                  <span className="glow-result-icon">
                    {run.phase === 'won' ? (
                      <Trophy />
                    ) : run.phase === 'lost' ? (
                      <RotateCcw />
                    ) : (
                      <Sparkles />
                    )}
                  </span>
                  {run.phase === 'cleared' ? (
                    <>
                      <span className="glow-result-label">3 of 3 beacons lit</span>
                      <h3 ref={outcome} tabIndex={-1}>
                        {world.board} cleared!
                      </h3>
                      <p>Next stop, {worlds[run.depth + 1].board}. Pick your loadout.</p>
                      <button className="glow-choice" onClick={() => continueRun(nextBoard(run, false))}>
                        <span>
                          <strong>Steady dive</strong>
                          <small>5 sparks · normal points</small>
                        </span>
                        <ArrowRight size={17} />
                      </button>
                      <button
                        className="glow-choice glow-risk"
                        onClick={() => continueRun(nextBoard(run, true))}
                      >
                        <span>
                          <strong>Double down</strong>
                          <small>3 sparks · double points</small>
                        </span>
                        <Zap size={17} />
                      </button>
                    </>
                  ) : run.phase === 'lost' ? (
                    <>
                      <span className="glow-result-label">Out of sparks</span>
                      <h3 ref={outcome} tabIndex={-1}>
                        One more drop?
                      </h3>
                      <p>Retry {world.board} with a full reserve. Your earlier worlds are safe.</p>
                      <button className="glow-primary" onClick={() => continueRun(retryBoard(run))}>
                        <RotateCcw size={16} /> Retry this world
                      </button>
                      <button className="glow-text" onClick={share}>
                        <Share2 size={14} /> Share result
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="glow-result-label">15 of 15 beacons lit</span>
                      <h3 ref={outcome} tabIndex={-1}>
                        Pip made it home!
                      </h3>
                      <p>
                        <strong>{scoreText(run.score)} points</strong> across five worlds. {run.drops}{' '}
                        drops, {run.retries} {run.retries === 1 ? 'retry' : 'retries'}. Longest combo,{' '}
                        {run.bestChain} {run.bestChain === 1 ? 'beacon' : 'beacons'}.
                      </p>
                      <button className="glow-primary" onClick={share}>
                        <Share2 size={16} /> Share result
                      </button>
                      <button className="glow-text" onClick={() => continueRun(newRun(run.seed))}>
                        <RotateCcw size={14} /> Play this chart again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {!result && (
            <div className="glow-controls">
              <div className="glow-aim">
                <label htmlFor="glow-angle">
                  Aim <b>{angleText(angle)}</b>
                </label>
                <input
                  id="glow-angle"
                  type="range"
                  min={-MAX_ANGLE}
                  max={MAX_ANGLE}
                  step="1"
                  value={angle}
                  aria-valuetext={angleText(angle)}
                  aria-describedby="glow-beacon-guide"
                  disabled={!ready}
                  onChange={(event) => setAngle(Number(event.target.value))}
                  onKeyDown={(event) => {
                    if (event.code === 'Space') {
                      event.preventDefault();
                      if (!event.repeat) drop(angle);
                    }
                  }}
                />
              </div>
              {flight ? (
                <div className="glow-flight-controls">
                  <button aria-label={paused ? 'Resume' : 'Pause'} onClick={() => setPaused(!paused)}>
                    {paused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button onClick={finish}>
                    <SkipForward size={15} /> Finish drop
                  </button>
                </div>
              ) : (
                <button ref={action} className="glow-primary glow-launch" onClick={() => drop(angle)}>
                  <ArrowDown size={17} /> Drop spark
                </button>
              )}
            </div>
          )}
          <div className="glow-hint-row">
            <p className="glow-board-note" id="glow-controls-hint" role="status">
              {feedback ||
                (result ? (
                  run.phase === 'lost' ? (
                    'Your chart is ready for a retry.'
                  ) : (
                    `${30 * run.sparks} spare-spark bonus points.`
                  )
                ) : flight ? (
                  'Spark in play…'
                ) : (
                  <>
                    <span className="glow-touch-hint">Drag to aim, release to drop.</span>
                    <span className="glow-key-hint">
                      Aim with ← → and press Space, or click the board.
                    </span>
                  </>
                ))}
            </p>
            {ready && run.sparks <= 2 && (
              <button className="glow-text" onClick={aimHint}>
                <Rabbit size={14} /> Pip’s aim hint
              </button>
            )}
          </div>
          {shareText && (
            <label className="glow-share">
              Copy your challenge
              <textarea readOnly value={shareText} onFocus={(e) => e.currentTarget.select()} />
            </label>
          )}
          {!saved && (
            <p className="glow-board-note">
              Storage is unavailable. This game will last for this visit.
            </p>
          )}
        </section>
        <aside className="glow-records" aria-label="Run progress">
          <div className="glow-route-heading">
            <h2>Your route</h2>
            <span>
              <Trophy size={14} /> Chart best <b>{scoreText(session.best)}</b>
            </span>
          </div>
          <ol className="glow-route">
            {worlds.map((entry, i) => {
              const Icon = worldIcons[i];
              const done =
                i < run.depth || (i === run.depth && !flight && ['won', 'cleared'].includes(run.phase));
              return (
                <li
                  key={entry.id}
                  className={done ? 'done' : i === run.depth ? 'current' : ''}
                  aria-current={i === run.depth ? 'step' : undefined}
                >
                  <span className="glow-stop" style={{ '--stop-color': entry.accent } as CSSProperties}>
                    {done ? <Check size={17} /> : <Icon size={17} />}
                  </span>
                  <span>{entry.name}</span>
                </li>
              );
            })}
          </ol>
          <div className="glow-pip-tip">
            <span className="glow-tip-icon">
              <Rabbit size={19} />
            </span>
            <p>
              <b>Pip’s tip</b> {world.tip}
            </p>
          </div>
          {latestNote && evidence && (
            <details className="glow-find" key={world.id}>
              <summary>
                <BookOpen size={17} />
                <span>
                  <small>From your beacons</small>
                  {latestNote.title}
                </span>
                <ChevronRight size={17} />
              </summary>
              <p>{evidence.summary}</p>
              <div>
                <a href={evidence.source.url} target="_blank" rel="noreferrer">
                  Read source <ArrowUpRight size={13} />
                </a>
                <button className="glow-text" onClick={() => onJournal(world.id, runHash(session))}>
                  Read {world.name} field notes <ArrowRight size={13} />
                </button>
              </div>
            </details>
          )}
        </aside>
      </main>
      <dialog
        className="glow-help"
        ref={dialog}
        onClose={() => setHelp(false)}
        aria-labelledby="glow-help-title"
      >
        <div>
          <button
            className="glow-close"
            aria-label="Close instructions"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
          <span className="glow-result-icon">
            <AudioLines size={24} />
          </span>
          <h2 id="glow-help-title">How to play</h2>
          <ol>
            <li>
              <strong>Aim and drop.</strong> Drag on the board and release, or adjust the slider and
              press Drop spark. Arrow keys aim and Space drops.
            </li>
            <li>
              <strong>Light three gold beacons.</strong> Bank off a bumper for more points. Hit multiple
              beacons in one shot for a combo.
            </li>
            <li>
              <strong>Save your sparks.</strong> The moving scoop returns a falling spark. With two
              sparks left, Pip can suggest an angle. Each spare spark earns 30 points when a world
              clears.
            </li>
            <li>
              <strong>Bring Pip home.</strong> Finish all five worlds. Between worlds, pick five sparks
              at normal points or three at double points.
            </li>
          </ol>
          <button className="glow-primary" onClick={() => dialog.current?.close()}>
            Back to the board <ArrowRight size={16} />
          </button>
        </div>
      </dialog>
    </div>
  );
}
