import { useEffect, useRef, useState } from "react";
import type { World } from "./questions";

export function OceanExperiment({
  initialDepth = 0,
}: {
  initialDepth?: number;
}) {
  const [depth, setDepth] = useState(initialDepth);
  const zone =
    depth < 200
      ? "Sunlit water"
      : depth < 1000
        ? "The twilight zone"
        : depth < 2500
          ? "Beyond sunlight"
          : "A hydrothermal-vent habitat";
  return (
    <div className="experiment ocean-experiment">
      <div className="experiment-heading">
        <span>TRY IT · DESCEND INTO THE OCEAN</span>
        <strong>{depth.toLocaleString()} m</strong>
      </div>
      <svg
        viewBox="0 0 600 240"
        role="img"
        aria-label={`${zone}, illustrated ocean at ${depth} metres`}
        style={{ background: `hsl(207 65% ${Math.max(5, 30 - depth / 140)}%)` }}
      >
        <defs>
          <linearGradient id={`sea-light-${initialDepth}`} x2="0" y2="1">
            <stop stopColor="#a7efff" stopOpacity=".5" />
            <stop offset="1" stopColor="#a7efff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M170 0L80 230H480L400 0Z"
          fill={`url(#sea-light-${initialDepth})`}
          opacity={Math.max(0, 1 - depth / 1000)}
        />
        {[100, 250, 420].map((x, i) => (
          <g
            key={x}
            transform={`translate(${x},${60 + i * 32})`}
            opacity={depth < 1000 ? 1 : 0.1}
          >
            <ellipse rx="20" ry="8" fill="#bbdde0" />
            <path d="M18 0L30-9V9Z" fill="#bbdde0" />
          </g>
        ))}
        {depth >= 1000 && (
          <g fill="#71e9de">
            <circle cx="130" cy="90" r="3" />
            <circle cx="460" cy="110" r="4" />
            <path d="M265 100Q300 50 335 100Z" fill="#56b7cd" />
            <path
              d="M278 100q-10 25 0 45m20-45q-10 30 0 55m20-55q10 25 0 45"
              stroke="#81d4e6"
              fill="none"
            />
          </g>
        )}
        <path d="M0 218Q90 195 150 214T350 205T600 215V240H0Z" fill="#132d3c" />
        <g opacity={depth >= 2500 ? 1 : 0}>
          <path
            d="M220 225L240 130H270L286 225M340 225L352 165H377L395 225"
            fill="#476173"
          />
          <path
            d="M246 130Q200 90 253 60T240 0M264 130Q300 95 265 60T280 0"
            fill="none"
            stroke="#8493a5"
            strokeWidth="17"
            opacity=".45"
          />
          <g stroke="#f0e5c7" strokeWidth="4">
            <path d="M300 225q-12-45 2-60m9 60q-3-40 14-56m-28 56q-30-28-24-43" />
          </g>
          <g fill="#ed807c">
            <circle cx="302" cy="165" r="5" />
            <circle cx="325" cy="169" r="5" />
            <circle cx="273" cy="182" r="5" />
          </g>
        </g>
        <text x="22" y="28" fill="#d9f4ff" fontSize="13">
          {zone}
        </text>
      </svg>
      <label>
        Ocean depth{" "}
        <input
          aria-label="Ocean depth"
          type="range"
          min="0"
          max="4000"
          step="100"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
      </label>
      <p className="experiment-result" aria-live="polite">
        {depth < 200
          ? "Sunlight can support photosynthesis near the surface. Move the marker deeper."
          : depth < 1000
            ? "Light fades with depth. Too little reaches much of this zone for photosynthesis."
            : depth < 2500
              ? "Sunlight no longer reaches here. Some animals make their own light; food can also arrive from above."
              : "At some vents, microbes use energy from chemical reactions to build organic matter. They can support food webs without local sunlight."}
      </p>
      <small>
        Illustrated habitats, not a survey of one location. Light limits vary;
        vent depths vary, and most deep-sea life does not live at vents.
      </small>
    </div>
  );
}

function NetworkExperiment() {
  const [loop, setLoop] = useState(false),
    [cut, setCut] = useState(false);
  const nodes = [
    { x: 80, y: 120 },
    { x: 170, y: 65 },
    { x: 280, y: 65 },
    { x: 390, y: 65 },
    { x: 500, y: 120 },
    { x: 280, y: 190 },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    ...(loop ? [[5, 0]] : []),
  ].filter(([a, b]) => !(cut && a === 2 && b === 3));
  const reached = new Set([0]);
  for (let pass = 0; pass < 6; pass++)
    for (const [a, b] of edges) {
      if (reached.has(a)) reached.add(b);
      if (reached.has(b)) reached.add(a);
    }
  return (
    <div className="experiment nature-experiment">
      <div className="experiment-heading">
        <span>TRY IT · BREAK ONE CONNECTION</span>
        <strong>{reached.size} / 6 connected</strong>
      </div>
      <svg
        viewBox="0 0 580 245"
        role="img"
        aria-label={`${reached.size} of 6 nodes reachable from the first node`}
      >
        {edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="#a6c87e"
            strokeWidth="3"
          />
        ))}
        {nodes.map((p, i) => (
          <g key={i}>
            <circle
              {...{ cx: p.x, cy: p.y }}
              r="20"
              fill={reached.has(i) ? "#c8e5a3" : "#35412d"}
            />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              fill={reached.has(i) ? "#183018" : "#aabb99"}
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <div className="experiment-buttons">
        <button aria-pressed={cut} onClick={() => setCut(!cut)}>
          {cut ? "Restore connection" : "Remove connection"}
        </button>
        <button aria-pressed={loop} onClick={() => setLoop(!loop)}>
          {loop ? "Use a single route" : "Add a backup route"}
        </button>
      </div>
      <p className="experiment-result" aria-live="polite">
        {cut && !loop
          ? "One broken link separates the chain. Add a backup route and watch the nodes reconnect."
          : cut
            ? "The broken link remains broken, but the alternative route keeps all six nodes reachable."
            : "All six nodes are reachable. Try removing the connection between 3 and 4."}
      </p>
      <small>
        A toy model: undirected links, one failed connection, no capacity or
        resource costs. Real forests are much more complex; connectivity does
        not establish cooperation or thought.
      </small>
    </div>
  );
}

function MindExperiment() {
  const [reading, setReading] = useState<"vase" | "faces" | null>(null);
  return (
    <div className="experiment mind-experiment">
      <div className="experiment-heading">
        <span>TRY IT · WHAT DO YOU SEE FIRST?</span>
      </div>
      <svg
        viewBox="0 0 500 230"
        role="img"
        aria-label="Ambiguous figure: a central vase shares its outline with two profiles facing each other"
      >
        <rect width="500" height="230" rx="12" fill="#362b4a" />
        <path
          d="M180 15H320C290 40 290 55 315 70L290 85L300 100L287 115C285 145 282 165 305 188L320 215H180L195 188C218 165 215 145 213 115L200 100L210 85L185 70C210 55 210 40 180 15Z"
          fill="#e9dff3"
          stroke={reading ? "#d9a2ff" : "none"}
          strokeWidth="4"
        />
        {reading === "faces" && (
          <g fill="#dfb5f4">
            <circle cx="165" cy="65" r="4" />
            <circle cx="335" cy="65" r="4" />
          </g>
        )}
      </svg>
      <div className="experiment-buttons">
        <button
          aria-pressed={reading === "vase"}
          onClick={() => setReading("vase")}
        >
          A vase
        </button>
        <button
          aria-pressed={reading === "faces"}
          onClick={() => setReading("faces")}
        >
          Two faces
        </button>
      </div>
      <p className="experiment-result" aria-live="polite">
        {reading
          ? `You chose ${reading === "vase" ? "the vase. Now look at the dark shapes on either side" : "the faces. Now look at the pale shape in the center"}. The border is unchanged; what you treat as figure and background can change.`
          : "Choose your first reading, then try finding another one. There is no score."}
      </p>
      <small>
        An illustration of figure–ground ambiguity, not a diagnostic test or
        proof about consciousness.{" "}
        <a
          href="https://www.britannica.com/science/perception/Figure-ground"
          target="_blank"
          rel="noreferrer"
        >
          Read about figure and ground ↗
        </a>
      </small>
    </div>
  );
}

const distanceToLine = (
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  const t = Math.max(
    0,
    Math.min(
      1,
      ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) /
        ((bx - ax) ** 2 + (by - ay) ** 2),
    ),
  );
  return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
};
function FootballExperiment() {
  const [players, setPlayers] = useState([
    { x: 75, y: 120 },
    { x: 210, y: 65 },
    { x: 390, y: 120 },
    { x: 210, y: 185 },
  ]);
  const [selected, setSelected] = useState(1),
    [dragging, setDragging] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const move = (i: number, x: number, y: number) =>
    setPlayers((old) =>
      old.map((p, j) =>
        i === j
          ? {
              x: Math.max(35, Math.min(465, x)),
              y: Math.max(35, Math.min(205, y)),
            }
          : p,
      ),
    );
  const options = players
    .slice(1)
    .map((p) => distanceToLine(230, 120, 75, 120, p.x, p.y) > 22);
  return (
    <div className="experiment football-experiment">
      <div className="experiment-heading">
        <span>TRY IT · CREATE A PASSING OPTION</span>
        <strong>{options.filter(Boolean).length} open lanes</strong>
      </div>
      <svg
        ref={svg}
        viewBox="0 0 500 240"
        role="group"
        aria-label="Simplified football pitch. Drag a teammate, or select one and use arrow keys."
        onPointerMove={(e) => {
          if (dragging === null) return;
          const point = svg.current!.createSVGPoint();
          point.x = e.clientX;
          point.y = e.clientY;
          const mapped = point.matrixTransform(
            svg.current!.getScreenCTM()!.inverse(),
          );
          move(dragging, mapped.x, mapped.y);
        }}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
      >
        <rect
          x="15"
          y="15"
          width="470"
          height="210"
          rx="5"
          fill="#153d2d"
          stroke="#799f83"
        />
        <path
          d="M250 15V225M15 65H65V175H15M485 65H435V175H485"
          fill="none"
          stroke="#799f83"
        />
        <circle cx="250" cy="120" r="35" fill="none" stroke="#799f83" />
        {players.slice(1).map((p, i) => (
          <line
            key={i}
            x1="75"
            y1="120"
            x2={p.x}
            y2={p.y}
            stroke={options[i] ? "#c6ee96" : "#e5a185"}
            strokeWidth="3"
            strokeDasharray={options[i] ? undefined : "6 6"}
          />
        ))}
        <circle cx="230" cy="120" r="15" fill="#df947b" />
        {players.map((p, i) => (
          <g
            key={i}
            role={i ? "button" : undefined}
            tabIndex={i ? 0 : undefined}
            aria-label={i ? `Move player ${i + 1}` : undefined}
            aria-pressed={i ? selected === i : undefined}
            onClick={() => {
              if (i) setSelected(i);
            }}
            onPointerDown={(e) => {
              if (!i) return;
              setSelected(i);
              setDragging(i);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onKeyDown={(e) => {
              if (!i || !e.key.startsWith("Arrow")) return;
              e.preventDefault();
              setSelected(i);
              move(
                i,
                p.x +
                  (e.key === "ArrowRight"
                    ? 10
                    : e.key === "ArrowLeft"
                      ? -10
                      : 0),
                p.y +
                  (e.key === "ArrowDown" ? 10 : e.key === "ArrowUp" ? -10 : 0),
              );
            }}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r="18"
              fill={i === selected ? "#f1dda0" : "#d8e9c8"}
              stroke={i === selected ? "#fff5dc" : "#153d2d"}
              strokeWidth="3"
            />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fill="#183022">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <label>
        Player {selected + 1}: across the pitch
        <input
          type="range"
          aria-label="Player horizontal position"
          min="35"
          max="465"
          value={players[selected].x}
          onChange={(e) =>
            move(selected, Number(e.target.value), players[selected].y)
          }
        />
      </label>
      <label>
        Player {selected + 1}: up or down
        <input
          type="range"
          aria-label="Player vertical position"
          min="35"
          max="205"
          value={players[selected].y}
          onChange={(e) =>
            move(selected, players[selected].x, Number(e.target.value))
          }
        />
      </label>
      <p className="experiment-result">
        Move a numbered teammate. Green lines avoid the defender; dashed orange
        lines pass too close.
      </p>
      <small>
        A static geometry sketch, not a match prediction. The ball carrier and
        defender stay fixed; timing, speed, interception, and offside are not
        modeled.
      </small>
    </div>
  );
}

function MusicExperiment() {
  const [tempo, setTempo] = useState(90),
    [tone, setTone] = useState<OscillatorType>("sine"),
    [playing, setPlaying] = useState(false),
    [message, setMessage] = useState("");
  const context = useRef<AudioContext | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function stop() {
    clearTimeout(timer.current);
    const current = context.current;
    context.current = null;
    if (current) void current.close();
    setPlaying(false);
  }
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      void context.current?.close();
    },
    [],
  );
  async function play() {
    stop();
    try {
      const audio = new AudioContext();
      context.current = audio;
      await audio.resume();
      if (context.current !== audio) return;
      setPlaying(true);
      setMessage("");
      const beat = 60 / tempo;
      [261.63, 329.63, 392, 329.63, 349.23, 293.66, 261.63, 261.63].forEach(
        (hz, i) => {
          const start = audio.currentTime + 0.05 + i * beat;
          const oscillator = audio.createOscillator(),
            gain = audio.createGain();
          oscillator.type = tone;
          oscillator.frequency.value = hz;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.07, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + beat * 0.8);
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(start);
          oscillator.stop(start + beat * 0.85);
        },
      );
      timer.current = setTimeout(stop, (beat * 8 + 0.1) * 1000);
    } catch {
      stop();
      setMessage(
        "Audio is unavailable in this browser. You can still compare the tempo settings visually.",
      );
    }
  }
  return (
    <div className="experiment music-experiment">
      <div className="experiment-heading">
        <span>TRY IT · SAME NOTES, DIFFERENT FEELING</span>
        <strong>{tempo} BPM</strong>
      </div>
      <div
        className={`melody-bars ${playing ? "is-playing" : ""}`}
        style={{ animationDuration: `${60 / tempo}s` }}
        aria-hidden="true"
      >
        {[40, 62, 90, 62, 72, 51, 40, 40].map((height, i) => (
          <i
            key={i}
            style={{ height: `${height}%`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
      <label>
        Tempo
        <input
          type="range"
          aria-label="Melody tempo"
          min="60"
          max="160"
          value={tempo}
          onChange={(e) => {
            stop();
            setTempo(Number(e.target.value));
          }}
        />
      </label>
      <label>
        Sound
        <select
          aria-label="Melody sound"
          value={tone}
          onChange={(e) => {
            stop();
            setTone(e.target.value as OscillatorType);
          }}
        >
          <option value="sine">Soft tone</option>
          <option value="triangle">Brighter tone</option>
        </select>
      </label>
      <div className="experiment-buttons">
        <button onClick={playing ? stop : play}>
          {playing ? "Stop melody" : "Play melody"}
        </button>
      </div>
      <p className="experiment-result" role="status">
        {message ||
          "Listen, change one setting, then play again. Does it feel calmer, more urgent, or unchanged?"}
      </p>
      <small>
        An original eight-note pattern, played only on request. Musical
        responses vary with context, culture, and personal associations; tempo
        does not determine emotion.
      </small>
    </div>
  );
}

export default function Experiment({
  world,
  initialDepth = 0,
}: {
  world: World;
  initialDepth?: number;
}) {
  if (world === "ocean") return <OceanExperiment initialDepth={initialDepth} />;
  if (world === "forest") return <NetworkExperiment />;
  if (world === "dreams") return <MindExperiment />;
  if (world === "football") return <FootballExperiment />;
  return <MusicExperiment />;
}
