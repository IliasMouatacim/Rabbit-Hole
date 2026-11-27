import { dailySeed } from '../expedition-engine';
import { newRun, worlds, type Run } from './glow-engine';

export type Mode = 'daily' | 'free';
export type Session = { mode: Mode; run: Run; best: number };
const prefix = 'rh-glow-v1';
const unsaved = new Map<string, Session>();
let unsavedFree: string | undefined;
const slotKey = (mode: Mode, seed: string) => `${prefix}-${mode}-${seed}`;
const validSeed = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Z0-9-]{1,24}$/.test(value);
const whole = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;

function validRun(value: unknown, seed: string): value is Run {
  if (!value || typeof value !== 'object') return false;
  const r = value as Run;
  if (
    r.seed !== seed ||
    !whole(r.depth) ||
    r.depth >= worlds.length ||
    !whole(r.lit) ||
    r.lit > 7 ||
    !whole(r.sparks) ||
    r.sparks > 5 ||
    !whole(r.score) ||
    !whole(r.entryScore) ||
    r.entryScore > r.score ||
    ![1, 2].includes(r.multiplier) ||
    !whole(r.drops) ||
    !whole(r.retries) ||
    !whole(r.bestChain) ||
    r.bestChain > 3
  )
    return false;
  if (r.lit === 7) return r.phase === (r.depth === worlds.length - 1 ? 'won' : 'cleared');
  return r.phase === (r.sparks === 0 ? 'lost' : 'aim');
}

export function freshSeed() {
  return 'DIVE-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase();
}

export function openSession(mode: Mode, requestedSeed?: string): Session {
  let seed = validSeed(requestedSeed) ? requestedSeed : undefined;
  if (mode === 'daily') {
    const day = seed?.slice(6);
    const date = new Date(day + 'T12:00:00Z');
    if (
      !seed?.startsWith('DAILY-') ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== day
    )
      seed = dailySeed();
  }
  if (!seed && mode === 'free') seed = unsavedFree;
  try {
    if (!seed) {
      const previous = localStorage.getItem(`${prefix}-free-chart`);
      if (validSeed(previous)) seed = previous;
    }
    if (seed) {
      const key = slotKey(mode, seed);
      const temporary = unsaved.get(key);
      if (temporary) return temporary;
      const slot = JSON.parse(localStorage.getItem(key) || 'null');
      if (validRun(slot?.run, seed))
        return { mode, run: slot.run, best: whole(slot.best) ? slot.best : 0 };
    }
  } catch {
    /* The same boards work with storage disabled. */
  }
  return { mode, run: newRun(seed || freshSeed()), best: 0 };
}

export function sessionFromHash(hash: string) {
  const params = new URLSearchParams(hash.split('?')[1]);
  const mode = params.get('mode') === 'free' ? 'free' : 'daily';
  const seed = params.get('seed') || undefined;
  return openSession(mode, seed);
}

export function runHash(session: Session) {
  const params = new URLSearchParams({ mode: session.mode, seed: session.run.seed });
  return '#glow?' + params.toString();
}

export function saveSession(session: Session) {
  const key = slotKey(session.mode, session.run.seed);
  try {
    let oldBest: unknown;
    try {
      oldBest = JSON.parse(localStorage.getItem(key) || 'null')?.best;
    } catch {
      /* Replace a damaged checkpoint. */
    }
    const best = Math.max(session.best, whole(oldBest) ? oldBest : 0);
    localStorage.setItem(key, JSON.stringify({ run: session.run, best }));
    if (session.mode === 'free') {
      localStorage.setItem(`${prefix}-free-chart`, session.run.seed);
      unsavedFree = undefined;
    }
    unsaved.delete(key);
    return { best, saved: true };
  } catch {
    unsaved.set(key, session);
    if (session.mode === 'free') unsavedFree = session.run.seed;
    return { best: session.best, saved: false };
  }
}
