import { random } from '../expedition-engine';
import {
  BEACON_RADIUS,
  DRAIN,
  GATE_HALF_WIDTH,
  HEIGHT,
  LAUNCH,
  SPARK_RADIUS,
  WALL,
  WIDTH,
  gateX,
  keeper,
  worlds,
  type Board,
  type Frame,
  type Pin,
  type Point,
  type Shot,
} from './glow-engine';

type Brush = CanvasRenderingContext2D;

function disc(ctx: Brush, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function ring(ctx: Brush, x: number, y: number, r: number, color: string, width = 1) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function glint(ctx: Brush, x: number, y: number, size: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x + 1, y - 1, x + size * 0.78, y);
  ctx.quadraticCurveTo(x + 1, y + 1, x, y + size);
  ctx.quadraticCurveTo(x - 1, y + 1, x - size * 0.78, y);
  ctx.quadraticCurveTo(x - 1, y - 1, x, y - size);
  ctx.fillStyle = color;
  ctx.fill();
}

function paintPin(ctx: Brush, pin: Pin, accent: string) {
  const { x, y, r } = pin;
  disc(ctx, x, y + 3, r + 2, '#06131c99');
  const enamel = ctx.createLinearGradient(x, y - r, x + 4, y + r);
  enamel.addColorStop(0, pin.kind === 'pin' ? '#66949b' : accent);
  enamel.addColorStop(0.3, '#345d65');
  enamel.addColorStop(1, '#172b39');
  ctx.fillStyle = enamel;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ring(ctx, x, y, r, pin.kind === 'pin' ? '#9dd2cd88' : accent, 1.4);
  ring(ctx, x, y, r - 3.5, '#142d37', 1);
  if (pin.kind === 'spring') {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -1; i <= 1; i++) {
      ctx.moveTo(x - 4, y + i * 4 + 1);
      ctx.lineTo(x + 4, y + i * 4 - 1);
    }
    ctx.stroke();
  } else if (pin.kind === 'chime') {
    glint(ctx, x, y, 7, accent);
  } else {
    disc(ctx, x - 1, y - 1, 2.2, '#accdc7');
  }
}

function paintHabitat(ctx: Brush, board: Board) {
  const world = worlds[board.depth];
  const rng = random('habitat-' + board.depth);
  const water = ctx.createLinearGradient(0, 0, WIDTH * 0.7, HEIGHT);
  water.addColorStop(0, world.water);
  water.addColorStop(0.65, world.shadow);
  water.addColorStop(1, '#07171f');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (board.depth === 0 || board.depth === 1) {
    for (let i = 0; i < 6; i++) {
      const x = i * 112;
      const rays = ctx.createLinearGradient(x, 0, x - 45, HEIGHT * 0.8);
      rays.addColorStop(0, world.accent + '14');
      rays.addColorStop(1, world.accent + '00');
      ctx.fillStyle = rays;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 34, 0);
      ctx.lineTo(x - 110, HEIGHT);
      ctx.lineTo(x - 210, HEIGHT);
      ctx.fill();
    }
    // Kelp and fern silhouettes stay behind the physical playfield.
    for (const edge of [0, WIDTH]) {
      const side = edge === 0 ? 1 : -1;
      for (let i = 0; i < 8; i++) {
        const root = edge + side * rng() * 58;
        const h = 45 + rng() * 155;
        const lean = side * (5 + rng() * 34);
        ctx.beginPath();
        ctx.moveTo(root, HEIGHT);
        ctx.bezierCurveTo(
          root - lean,
          HEIGHT - h * 0.6,
          root + lean,
          HEIGHT - h * 0.55,
          root + lean,
          HEIGHT - h,
        );
        ctx.bezierCurveTo(root + lean * 2, HEIGHT - h * 0.5, root, HEIGHT - h * 0.45, root + 8, HEIGHT);
        ctx.fillStyle = board.depth === 1 ? '#65997830' : '#3eada237';
        ctx.fill();
      }
    }
  } else if (board.depth === 2) {
    disc(ctx, 407, 97, 62, '#7360a636');
    ring(ctx, 407, 97, 71, '#e2c9ff25');
    for (let i = 0; i < 4; i++) ring(ctx, 65, HEIGHT + 68, 120 + i * 20, '#d5baff18', 2);
  } else if (board.depth === 3) {
    ctx.strokeStyle = '#ffe8ac24';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 24, WIDTH - 70, HEIGHT - 48);
    ctx.strokeRect(WIDTH / 2 - 72, 24, 144, 50);
    ctx.strokeRect(WIDTH / 2 - 72, HEIGHT - 74, 144, 50);
    ring(ctx, WIDTH / 2, HEIGHT / 2, 66, '#ffe8ac25', 1.5);
    ctx.fillStyle = '#ffe8ac1b';
    ctx.fillRect(35, HEIGHT / 2, WIDTH - 70, 1);
  } else {
    for (let i = 0; i < 11; i++) ring(ctx, WIDTH + 45, HEIGHT - 116, 34 + 14 * i, '#ffc9e523', 1.2);
    for (let i = 0; i < 55; i++) {
      const h = 6 + rng() * 32;
      ctx.fillStyle = '#e788b91d';
      ctx.fillRect(i * 10, HEIGHT - h, 4, h);
    }
  }

  for (let i = 0; i < 82; i++) {
    const x = 20 + rng() * (WIDTH - 40);
    const y = 16 + rng() * (HEIGHT - 32);
    disc(ctx, x, y, 0.5 + rng() * 1.15, world.accent + '40');
  }
  for (const x of [WALL, WIDTH - WALL]) {
    ctx.fillStyle = '#b3ddd729';
    ctx.fillRect(x, 16, 1, DRAIN - 15);
    for (let y = 28; y < DRAIN; y += 14) {
      const tick = y % 28 === 0 ? 5 : 3;
      ctx.fillRect(x === WALL ? x - tick : x, y, tick, 1);
    }
  }
}

export function makeBackdrop(board: Board) {
  const image = document.createElement('canvas');
  image.width = WIDTH * 2;
  image.height = HEIGHT * 2;
  const ctx = image.getContext('2d');
  if (ctx) {
    ctx.scale(2, 2);
    paintHabitat(ctx, board);
    for (const pin of board.pins) paintPin(ctx, pin, worlds[board.depth].accent);
    for (const portal of board.portals) {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(portal.x, portal.y, 11 + i * 3, 6 + i * 3, -0.55, 0, Math.PI * 2);
        ctx.strokeStyle = ['#fbf2ff', '#d8afff', '#aa7ae5', '#8d62d366'][i];
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
  return image;
}

function paintBeacons(ctx: Brush, board: Board, lit: number) {
  board.beacons.forEach((p, i) => {
    if (lit & (1 << i)) {
      ring(ctx, p.x, p.y, 10, '#f3e4a572');
      ctx.strokeStyle = '#ffdfa8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y);
      ctx.lineTo(p.x - 1, p.y + 3);
      ctx.lineTo(p.x + 5, p.y - 4);
      ctx.stroke();
      return;
    }
    const halo = ctx.createRadialGradient(p.x, p.y, 3, p.x, p.y, 38);
    halo.addColorStop(0, '#ffc4618c');
    halo.addColorStop(1, '#ffa84200');
    ctx.fillStyle = halo;
    ctx.fillRect(p.x - 38, p.y - 38, 76, 76);
    ring(ctx, p.x, p.y, BEACON_RADIUS + 4, '#f2b96185');
    glint(ctx, p.x, p.y, 17, '#ffb64c');
    glint(ctx, p.x - 1, p.y - 1, 10, '#fff4cc');
  });
}

function paintLauncher(ctx: Brush, angle: number, ready: boolean) {
  ctx.save();
  ctx.translate(LAUNCH.x, LAUNCH.y);
  ctx.rotate((-angle * Math.PI) / 180);
  ctx.fillStyle = '#20373d';
  ctx.strokeStyle = '#d2bd91';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-9, -22, 18, 27, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff9860';
  ctx.fillRect(-10, -7, 20, 4);
  if (ready) {
    ctx.shadowBlur = 13;
    ctx.shadowColor = '#ffe394';
    disc(ctx, 0, 3, 5.7, '#fff1ba');
  }
  ctx.restore();
}

function paintScoop(ctx: Brush, board: Board, time: number) {
  const x = gateX(board, time);
  ctx.fillStyle = '#a9dcd62b';
  ctx.fillRect(WALL, DRAIN + 10, WIDTH - WALL * 2, 1);
  ctx.beginPath();
  ctx.moveTo(x - GATE_HALF_WIDTH, DRAIN - 5);
  ctx.lineTo(x - GATE_HALF_WIDTH + 9, DRAIN + 9);
  ctx.lineTo(x + GATE_HALF_WIDTH - 9, DRAIN + 9);
  ctx.lineTo(x + GATE_HALF_WIDTH, DRAIN - 5);
  ctx.strokeStyle = '#90f3d8';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fillStyle = '#98e7d929';
  ctx.fill();
  for (let i = -1; i <= 1; i++) disc(ctx, x + 8 * i, DRAIN + 5, 1.5, '#b8fae5');
}

function paintEffects(ctx: Brush, shot: Shot, time: number, reduced: boolean) {
  for (const event of shot.events) {
    const age = time - event.time;
    if (age < 0 || age > 0.7) continue;
    const fade = 1 - age / 0.7;
    const beacon = event.kind === 'beacon';
    const color = beacon ? '#ffdd8f' : '#a8f4e4';
    ctx.globalAlpha = fade;
    if (!reduced) {
      ring(ctx, event.x, event.y, 10 + age * (beacon ? 60 : 38), color, fade * 2);
      if (beacon) {
        for (let i = 0; i < 8; i++) {
          const ray = (i * Math.PI) / 4 + event.x * 0.01;
          const dist = 16 + age * 57;
          glint(ctx, event.x + Math.cos(ray) * dist, event.y + Math.sin(ray) * dist, fade * 4.2, color);
        }
      }
    }
    if (beacon || event.kind === 'catch') {
      const text = beacon
        ? event.chain! > 1
          ? `CHAIN ×${event.chain}  +${event.points}`
          : `+${event.points}`
        : '+1 SPARK';
      ctx.fillStyle = color;
      ctx.strokeStyle = '#10212b';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px "DM Sans", sans-serif';
      const x = Math.max(62, Math.min(WIDTH - 62, event.x));
      const y = Math.max(23, event.y - 17 - (reduced ? 0 : age * 25));
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
  }
  ctx.globalAlpha = 1;
}

export function paintBoard(
  ctx: Brush,
  background: HTMLCanvasElement,
  board: Board,
  angle: number,
  lit: number,
  guide: Frame[],
  shot: Shot | undefined,
  time: number,
  reduced: boolean,
  aim: boolean,
) {
  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
  if (board.depth === 3) {
    const defender = keeper(board, time);
    paintPin(ctx, defender, worlds[board.depth].accent);
    ctx.fillStyle = '#ffe1a4';
    ctx.fillRect(defender.x - 10, defender.y - 2, 20, 4);
  }
  let currentLit = lit;
  if (shot) {
    for (const event of shot.events) {
      if (event.time > time) break;
      if (event.beacon !== undefined) currentLit |= 1 << event.beacon;
    }
  }
  paintBeacons(ctx, board, currentLit);
  paintScoop(ctx, board, time);
  if (!shot && aim) {
    for (let i = 2; i < guide.length; i += 3) {
      const point = guide[i];
      ctx.globalAlpha = 0.85 - (i / guide.length) * 0.53;
      disc(ctx, point.x, point.y, 2.25, '#fff3c6');
    }
    ctx.globalAlpha = 1;
  }
  paintLauncher(ctx, angle, !shot && aim);
  if (!shot) return;
  const frames = shot.frames;
  // Portals can add a sample between the regular 60 Hz frames.
  let index = Math.min(frames.length - 1, Math.floor(time * 60));
  while (index + 1 < frames.length && frames[index + 1].time <= time) index++;
  const point = frames[index];
  if (!reduced) {
    for (let i = Math.max(1, index - 10); i <= index; i++) {
      if (frames[i].warped) continue;
      const weight = 1 - (index - i) / 12;
      ctx.strokeStyle = `rgba(255, 200, 103, ${weight * 0.68})`;
      ctx.lineWidth = 1 + weight * 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(frames[i - 1].x, frames[i - 1].y);
      ctx.lineTo(frames[i].x, frames[i].y);
      ctx.stroke();
    }
  }
  ctx.save();
  ctx.shadowColor = '#ffcd66';
  ctx.shadowBlur = 15;
  disc(ctx, point.x, point.y, SPARK_RADIUS, '#fff2c5');
  ctx.restore();
  paintEffects(ctx, shot, time, reduced);
}

export function pointerAngle(point: Point) {
  return (Math.atan2(point.x - LAUNCH.x, Math.max(12, point.y - LAUNCH.y)) * 180) / Math.PI;
}
