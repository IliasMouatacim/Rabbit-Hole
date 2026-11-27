import { useEffect, useMemo, useRef, type PointerEvent } from 'react';
import {
  clampAngle,
  HEIGHT,
  MAX_ANGLE,
  traceDrop,
  WIDTH,
  type Board,
  type Run,
  type Shot,
  type ShotEvent,
} from './glow-engine';
import { makeBackdrop, paintBoard, pointerAngle } from './glow-paint';

export type Flight = { from: Run; angle: number; shot: Shot };

type Props = {
  board: Board;
  lit: number;
  angle: number;
  flight: Flight | null;
  ready: boolean;
  paused: boolean;
  reduced: boolean;
  onAim: (degrees: number) => void;
  onDrop: (degrees: number) => void;
  onEvent: (event: ShotEvent) => void;
  onFinish: () => void;
};

export default function GlowBoard({
  board,
  lit,
  angle,
  flight,
  ready,
  paused,
  reduced,
  onAim,
  onDrop,
  onEvent,
  onFinish,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<number | null>(null);
  const cursor = useRef({ flight, time: 0, event: 0 });
  const callbacks = useRef({ onEvent, onFinish });
  callbacks.current = { onEvent, onFinish };
  const background = useMemo(() => makeBackdrop(board), [board]);
  const preview = useMemo(
    () => (ready ? traceDrop(board, angle, lit, 1, 0.8) : undefined),
    [ready, board, angle, lit],
  );
  const positions = board.beacons.flatMap((point, i) => {
    if (lit & (1 << i)) return [];
    const vertical = point.y < HEIGHT / 3 ? 'upper' : point.y < (HEIGHT * 2) / 3 ? 'middle' : 'lower';
    const horizontal = point.x < WIDTH / 3 ? 'left' : point.x < (WIDTH * 2) / 3 ? 'center' : 'right';
    return [`${vertical} ${horizontal}`];
  });

  useEffect(() => {
    const surface = canvas.current!;
    const ctx = surface.getContext('2d', { alpha: false });
    if (cursor.current.flight !== flight) cursor.current = { flight, time: 0, event: 0 };
    const playhead = cursor.current;
    const length = flight?.shot.frames.at(-1)?.time ?? 0;
    let frame = 0;
    let previous = 0;
    const draw = () => {
      if (!ctx) return;
      ctx.setTransform(surface.width / WIDTH, 0, 0, surface.height / HEIGHT, 0, 0);
      paintBoard(
        ctx,
        background,
        board,
        angle,
        lit,
        preview?.frames ?? [],
        flight?.shot,
        playhead.time,
        reduced,
        ready,
      );
    };
    const resize = () => {
      const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(surface.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(surface.clientHeight * pixelRatio));
      if (surface.width !== width || surface.height !== height) {
        surface.width = width;
        surface.height = height;
      }
      draw();
    };
    const tick = (ms: number) => {
      if (!flight) return;
      if (previous) playhead.time += Math.min(0.15, (ms - previous) / 1000);
      previous = ms;
      while (
        playhead.event < flight.shot.events.length &&
        flight.shot.events[playhead.event].time <= playhead.time
      ) {
        callbacks.current.onEvent(flight.shot.events[playhead.event++]);
      }
      draw();
      if (playhead.time >= length + 0.22) callbacks.current.onFinish();
      else frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (flight && !document.hidden && !paused) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    document.addEventListener('visibilitychange', visibility);
    resize();
    visibility();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [angle, background, board, flight, preview, lit, paused, ready, reduced]);

  function aimAt(event: PointerEvent<HTMLButtonElement>) {
    const rect = canvas.current!.getBoundingClientRect();
    return clampAngle(
      pointerAngle({
        x: ((event.clientX - rect.left) * WIDTH) / rect.width,
        y: ((event.clientY - rect.top) * HEIGHT) / rect.height,
      }),
    );
  }

  return (
    <>
      <button
        type="button"
        className="glow-field"
        aria-label="Aim and drop a spark on the playfield"
        aria-describedby="glow-controls-hint glow-beacon-guide"
        aria-disabled={!ready}
        tabIndex={ready ? 0 : -1}
        onPointerDown={(event) => {
          if (!ready || !event.isPrimary || event.button !== 0) return;
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          onAim(aimAt(event));
        }}
        onPointerMove={(event) => {
          if (
            ready &&
            (pointer.current === event.pointerId || (event.pointerType === 'mouse' && !event.buttons))
          ) {
            onAim(aimAt(event));
          }
        }}
        onPointerUp={(event) => {
          if (pointer.current !== event.pointerId) return;
          pointer.current = null;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            ready &&
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
          )
            onDrop(aimAt(event));
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        onLostPointerCapture={() => {
          pointer.current = null;
        }}
        onClick={(event) => {
          if (ready && event.detail === 0) onDrop(angle);
        }}
        onKeyDown={(event) => {
          if (!ready) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            onAim(clampAngle(angle + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 5 : 1)));
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            onAim(event.key === 'Home' ? -MAX_ANGLE : MAX_ANGLE);
          }
        }}
      >
        <canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-hidden="true" />
      </button>
      <span className="glow-sr-only" id="glow-beacon-guide">
        {positions.length ? `Unlit beacons: ${positions.join(', ')}.` : 'All beacons lit.'}{' '}
        {preview?.chain ? 'Your aim guide crosses a gold beacon.' : ''}
      </span>
    </>
  );
}
