import { random } from '../expedition-engine';

export const WIDTH = 520;
export const HEIGHT = 484;
export const WALL = 15;
export const DRAIN = HEIGHT - 22;
export const LAUNCH = { x: WIDTH / 2, y: 38 };
export const MAX_ANGLE = 65;
export const SPARK_RADIUS = 7;
export const BEACON_RADIUS = 15;

export const worlds = [
  {
    id: 'ocean',
    name: 'Ocean',
    board: 'Pearl Trench',
    accent: '#84ece1',
    water: '#104752',
    shadow: '#071b29',
    tip: 'Catch the spark in the moving scoop to get your drop back.',
  },
  {
    id: 'forest',
    name: 'Nature',
    board: 'Spring Grove',
    accent: '#bdeb83',
    water: '#24473a',
    shadow: '#0c221f',
    tip: 'The striped spring pods give your spark an extra kick.',
  },
  {
    id: 'dreams',
    name: 'Mind',
    board: 'Mirror Pool',
    accent: '#c5a9ff',
    water: '#403966',
    shadow: '#181b35',
    tip: 'The violet portals are linked. Enter one and emerge from the other.',
  },
  {
    id: 'football',
    name: 'Football',
    board: 'After Hours',
    accent: '#ffcf81',
    water: '#324a49',
    shadow: '#101f29',
    tip: 'The keeper moves when you drop. Bank around it or use its rebound.',
  },
  {
    id: 'music',
    name: 'Music',
    board: 'Echo Hall',
    accent: '#ffa7ca',
    water: '#56394f',
    shadow: '#261a31',
    tip: 'Hit a chime before a beacon for a 75-point musical bonus.',
  },
] as const;

export type Point = { x: number; y: number };
export type Pin = Point & { r: number; kind: 'pin' | 'spring' | 'chime' };
export type Board = {
  depth: number;
  pins: Pin[];
  beacons: Point[];
  portals: Point[];
  gatePhase: number;
  initialAngle: number;
};
export type ShotEvent = Point & {
  time: number;
  kind: 'bank' | 'spring' | 'chime' | 'portal' | 'beacon' | 'catch';
  points: number;
  beacon?: number;
  chain?: number;
};
export type Frame = Point & { time: number; warped?: boolean };
export type Shot = {
  frames: Frame[];
  events: ShotEvent[];
  lit: number;
  caught: boolean;
  points: number;
  chain: number;
};
export type Run = {
  seed: string;
  depth: number;
  sparks: number;
  lit: number;
  score: number;
  entryScore: number;
  multiplier: 1 | 2;
  drops: number;
  retries: number;
  bestChain: number;
  phase: 'aim' | 'cleared' | 'won' | 'lost';
};

export function newRun(seed: string): Run {
  return {
    seed,
    depth: 0,
    sparks: 5,
    lit: 0,
    score: 0,
    entryScore: 0,
    multiplier: 1,
    drops: 0,
    retries: 0,
    bestChain: 0,
    phase: 'aim',
  };
}

export function countBeacons(mask: number) {
  return Number(Boolean(mask & 1)) + Number(Boolean(mask & 2)) + Number(Boolean(mask & 4));
}

export function clampAngle(degrees: number) {
  return Math.round(Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, degrees)));
}

export function gateX(board: Board, time: number) {
  return WIDTH / 2 + Math.sin(board.gatePhase + time * 1.65) * (WIDTH / 2 - 72);
}

export const GATE_HALF_WIDTH = 47;

export function keeper(board: Board, time: number): Pin {
  return {
    x: WIDTH / 2 + 108 * Math.sin(board.gatePhase + time * 1.9),
    y: 262,
    r: 21,
    kind: 'pin',
  };
}

// Simulate a whole drop at a fixed timestep. The aim guide, playback and scoring
// use the same collisions, including on displays with a different refresh rate.
export function traceDrop(
  board: Board,
  degrees: number,
  alreadyLit = 0,
  multiplier = 1,
  limit = 8,
): Shot {
  const angle = (clampAngle(degrees) * Math.PI) / 180;
  let { x, y } = LAUNCH;
  let vx = Math.sin(angle) * 325;
  let vy = Math.cos(angle) * 325;
  let lit = alreadyLit;
  let caught = false;
  let points = 0;
  let chain = 0;
  let warped = false;
  let usedPortal = false;
  let chimed = false;
  const touched = new Set<number>();
  const frames: Frame[] = [{ x, y, time: 0 }];
  const events: ShotEvent[] = [];
  const hz = 120;
  const steps = Math.ceil(limit * hz);

  for (let step = 1; step <= steps; step++) {
    const time = step / hz;
    vy += 240 / hz;
    x += vx / hz;
    y += vy / hz;
    const left = WALL + SPARK_RADIUS;
    const right = WIDTH - left;
    if (x < left || x > right) {
      x = Math.max(left, Math.min(right, x));
      vx *= -0.92;
    }
    if (y < 16 + SPARK_RADIUS) {
      y = 16 + SPARK_RADIUS;
      vy = Math.abs(vy) * 0.9;
    }

    const pinCount = board.pins.length + Number(board.depth === 3);
    for (let i = 0; i < pinCount; i++) {
      const pin = i < board.pins.length ? board.pins[i] : keeper(board, time);
      const dx = x - pin.x;
      const dy = y - pin.y;
      const radius = pin.r + SPARK_RADIUS;
      if (dx * dx + dy * dy >= radius * radius) continue;
      const distance = Math.hypot(dx, dy) || 1;
      const nx = dx / distance;
      const ny = dy / distance;
      x = pin.x + nx * (radius + 0.1);
      y = pin.y + ny * (radius + 0.1);
      const inward = vx * nx + vy * ny;
      if (inward >= 0) continue;
      const rebound = pin.kind === 'spring' ? 2.22 : 1.87;
      vx -= rebound * inward * nx;
      vy -= rebound * inward * ny;
      // A glancing sideways impulse prevents perfect vertical stalls on a peg.
      if (Math.abs(vx) < 18 && ny < -0.8) vx += nx < 0 ? -24 : 24;
      const cap = Math.min(1, 630 / (Math.hypot(vx, vy) || 1));
      vx *= cap;
      vy *= cap;
      if (!touched.has(i)) {
        touched.add(i);
        if (pin.kind === 'chime') chimed = true;
        events.push({
          x: pin.x,
          y: pin.y,
          time,
          kind: pin.kind === 'pin' ? 'bank' : pin.kind,
          points: 0,
        });
      }
    }

    if (!usedPortal && board.portals.length === 2) {
      const entrance = board.portals.findIndex((p) => Math.hypot(x - p.x, y - p.y) < 18);
      if (entrance !== -1) {
        const exit = board.portals[1 - entrance];
        events.push({ x, y, time, kind: 'portal', points: 0 });
        x = exit.x;
        y = exit.y + 20;
        usedPortal = true;
        warped = true;
      }
    }

    board.beacons.forEach((beacon, index) => {
      const bit = 1 << index;
      if (lit & bit || Math.hypot(beacon.x - x, beacon.y - y) > BEACON_RADIUS + SPARK_RADIUS) return;
      lit |= bit;
      chain++;
      const gain = (100 * chain + 25 * Math.min(touched.size, 3) + (chimed ? 75 : 0)) * multiplier;
      points += gain;
      events.push({ ...beacon, time, kind: 'beacon', beacon: index, chain, points: gain });
    });

    const drained = y >= DRAIN;
    if (drained && Math.abs(x - gateX(board, time)) <= GATE_HALF_WIDTH) {
      caught = true;
      events.push({ x, y: DRAIN, time, kind: 'catch', points: 0 });
    }
    if (step % 2 === 0 || warped || drained || step === steps) {
      frames.push({ x, y: Math.min(y, DRAIN), time, warped });
      warped = false;
    }
    if (drained) break;
  }
  return { frames, events, lit, caught, points, chain };
}

const pegRows = [
  [104, 90, 213, 348, 447],
  [183, 140, 265, 389],
  [263, 79, 190, 327, 451],
  [347, 120, 258, 399],
];

export function createBoard(seed: string, depth: number): Board {
  const rng = random(`glow-v1:${seed}:${depth}`);
  const flip = rng() < 0.5;
  const pins: Pin[] = [];
  for (const [row, ...columns] of pegRows) {
    for (const column of columns) {
      if (depth === 3 && row === 263 && column > 100 && column < 420) continue;
      const x = column + Math.round((rng() - 0.5) * 24);
      const y = row + Math.round((rng() - 0.5) * 15);
      const special = row === 183 || row === 347;
      const kind = special && depth === 1 ? 'spring' : special && depth === 4 ? 'chime' : 'pin';
      pins.push({
        x: flip ? WIDTH - x : x,
        y,
        kind,
        r: kind === 'pin' ? 10 + Math.round(rng() * 4) : 16,
      });
    }
  }
  const direction = flip ? -1 : 1;
  const bankAngle = direction * (24 + Math.floor(rng() * 19));
  const otherAngle = -direction * (18 + Math.floor(rng() * 28));
  const board: Board = {
    depth,
    pins,
    beacons: [],
    gatePhase: rng() * Math.PI * 2,
    portals:
      depth === 2
        ? [
            { x: 168, y: 145 },
            { x: 361, y: 304 },
          ]
        : [],
    initialAngle: depth === 0 ? bankAngle : 0,
  };
  const bankLine = traceDrop(board, bankAngle).frames;
  const otherLine = traceDrop(board, otherAngle).frames;

  // Place lights along reachable trajectories. One bank line links two lights,
  // while the opposite side gives each seeded board a different finishing shot.
  const candidates = (line: Frame[], targetY: number) => {
    const clear = line.filter(
      (p) =>
        p.y > 85 &&
        p.y < DRAIN - 32 &&
        p.x > 37 &&
        p.x < WIDTH - 37 &&
        pins.every((pin) => Math.hypot(pin.x - p.x, pin.y - p.y) > pin.r + BEACON_RADIUS + 5) &&
        board.portals.every((portal) => Math.hypot(portal.x - p.x, portal.y - p.y) > 38) &&
        board.beacons.every((beacon) => Math.hypot(beacon.x - p.x, beacon.y - p.y) > 65),
    );
    return clear.sort((a, b) => Math.abs(a.y - targetY) - Math.abs(b.y - targetY));
  };
  for (const [line, targetY] of [
    [bankLine, 137],
    [bankLine, 305],
    [otherLine, 283 + rng() * 93],
  ] as const) {
    let point = candidates(line, targetY)[0];
    if (!point) {
      // A rare long bounce can shorten a reference line. Search other launch
      // angles for open space, keeping the reachability guarantee.
      for (let angle = -MAX_ANGLE; angle <= MAX_ANGLE && !point; angle += 5) {
        point = candidates(traceDrop(board, angle).frames, targetY)[0];
      }
    }
    if (!point) throw new Error('No reachable beacon position');
    board.beacons.push({ x: Math.round(point.x), y: Math.round(point.y) });
  }
  return board;
}

export function settleDrop(run: Run, shot: Shot): Run {
  if (run.phase !== 'aim') return run;
  const sparks = run.sparks - 1 + Number(shot.caught);
  const cleared = shot.lit === 7;
  const phase = cleared
    ? run.depth === worlds.length - 1
      ? 'won'
      : 'cleared'
    : sparks === 0
      ? 'lost'
      : 'aim';
  return {
    ...run,
    sparks,
    lit: shot.lit,
    phase,
    drops: run.drops + 1,
    score: run.score + shot.points + (cleared ? 30 * sparks : 0),
    bestChain: Math.max(run.bestChain, shot.chain),
  };
}

export function nextBoard(run: Run, risk: boolean): Run {
  if (run.phase !== 'cleared') return run;
  return {
    ...run,
    depth: run.depth + 1,
    phase: 'aim',
    lit: 0,
    sparks: risk ? 3 : 5,
    multiplier: risk ? 2 : 1,
    entryScore: run.score,
  };
}

export function retryBoard(run: Run): Run {
  if (run.phase !== 'lost') return run;
  return {
    ...run,
    phase: 'aim',
    sparks: run.multiplier === 2 ? 3 : 5,
    lit: 0,
    score: run.entryScore,
    retries: run.retries + 1,
  };
}
