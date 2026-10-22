import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  GitBranch,
  Map,
  RotateCcw,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { allIdeas, topics } from "./data";
import { walkTrail, type World } from "./questions";
import { createCuriosityScene } from "./curiosity-scene";
import "./cinematic.css";
import "./questions.css";

const storageKey = (world: World) => `rh-journey-v1-${world}`;
function initialChoices(world: World) {
  const [route, query] = window.location.hash.split("?");
  const path = new URLSearchParams(query).get("p");
  if (route === `#journey/${world}` && path !== null) {
    const validPrefix = path.match(/^[012]*/)?.[0] ?? "";
    return walkTrail(world, [...validPrefix].map(Number)).choices;
  }
  try {
    return walkTrail(
      world,
      JSON.parse(localStorage.getItem(storageKey(world)) || "[]"),
    ).choices;
  } catch {
    return [];
  }
}

/** The landing scene is unmounted here, so only this scene owns an active rAF. */
function JourneyField({
  depth,
  choice,
}: {
  depth: number;
  choice: number | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef({ depth, choice });
  input.current = { depth, choice };
  useEffect(() => {
    const surface = canvas.current!;
    const container = surface.parentElement!;
    let scene: ReturnType<typeof createCuriosityScene>;
    try {
      scene = createCuriosityScene(surface, true);
    } catch {
      container.dataset.fallback = "true";
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      lastTime = 0,
      dirty = true,
      disposed = false;
    let x = 0,
      y = 0,
      easedX = 0,
      easedY = 0,
      turn = 0,
      energy = 0;
    const resize = () => {
      scene.resize(container.clientWidth, container.clientHeight);
      dirty = true;
    };
    const pointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const leave = () => {
      x = 0;
      y = 0;
    };
    const change = () => {
      dirty = true;
    };
    const loop = (time: number) => {
      if (disposed) return;
      const ease = 1 - Math.exp(-Math.min(64, time - lastTime || 16.7) / 160);
      lastTime = time;
      const targetTurn = media.matches
        ? 0
        : Math.log2(input.current.depth + 1) * 0.28 +
          (input.current.choice === null
            ? 0
            : (input.current.choice + 1) * 0.1);
      const targetEnergy =
        !media.matches && input.current.choice !== null ? 0.7 : 0;
      const tx = media.matches ? 0 : x,
        ty = media.matches ? 0 : y;
      const changing =
        Math.abs(turn - targetTurn) +
          Math.abs(easedX - tx) +
          Math.abs(easedY - ty) +
          Math.abs(energy - targetEnergy) >
        0.0005;
      turn += (targetTurn - turn) * ease;
      easedX += (tx - easedX) * ease;
      easedY += (ty - easedY) * ease;
      energy += (targetEnergy - energy) * ease;
      if (changing || dirty) {
        scene.render(turn, easedX, easedY, 0, 0, energy);
        dirty = false;
      }
      frame = requestAnimationFrame(loop);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        lastTime = 0;
        dirty = true;
        frame = requestAnimationFrame(loop);
      }
    };
    const lost = (e: Event) => {
      e.preventDefault();
      container.dataset.fallback = "true";
    };
    const restored = () => {
      delete container.dataset.fallback;
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    container.addEventListener("pointermove", pointer);
    container.addEventListener("pointerleave", leave);
    surface.addEventListener("webglcontextlost", lost);
    surface.addEventListener("webglcontextrestored", restored);
    media.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    frame = requestAnimationFrame(loop);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.dispose();
      container.removeEventListener("pointermove", pointer);
      container.removeEventListener("pointerleave", leave);
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", restored);
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div className="journey-field" aria-hidden="true">
      <canvas ref={canvas} />
      <div className="journey-field-fallback">
        <i />
        <i />
        <i />
      </div>
      <span className="field-bracket">+</span>
      <span className="field-bracket bottom">+</span>
    </div>
  );
}

export default function QuestionJourney({
  world,
  onHome,
  onMap,
  onWorld,
}: {
  world: World;
  onHome: () => void;
  onMap: (world: World, idea: string) => void;
  onWorld: (world: World) => void;
}) {
  const [choices, setChoices] = useState<number[]>(() => initialChoices(world));
  const [hover, setHover] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [trailOpen, setTrailOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const restartCancel = useRef<HTMLButtonElement>(null);
  const trailButton = useRef<HTMLButtonElement>(null);
  const trailClose = useRef<HTMLButtonElement>(null);
  const locked = useRef(false);
  const trail = useMemo(() => walkTrail(world, choices), [world, choices]);
  const { current, steps } = trail;
  const last = steps.at(-1);
  const currentTopic = topics.find((t) => t.id === current.world)!;
  const source = allIdeas.find(({ idea }) => idea.id === current.idea);
  const seen = steps.some((step) => step.question.id === current.id);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(world), JSON.stringify(choices));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
    window.history.replaceState(
      null,
      "",
      `#journey/${world}?p=${choices.join("")}`,
    );
    setHover(null);
    locked.current = false;
    heading.current?.focus({ preventScroll: true });
  }, [choices, world]);
  useEffect(() => {
    if (restartOpen) restartCancel.current?.focus();
  }, [restartOpen]);
  useEffect(() => {
    if (trailOpen) trailClose.current?.focus();
  }, [trailOpen]);
  useEffect(() => {
    if (!status) return;
    const id = setTimeout(() => setStatus(""), 4000);
    return () => clearTimeout(id);
  }, [status]);
  function choose(index: number) {
    if (locked.current) return;
    locked.current = true;
    setChoices((previous) => [...previous, index]);
    if (window.innerWidth < 800)
      window.scrollTo({ top: 0, behavior: "instant" });
  }
  function rewind(index: number) {
    setChoices((previous) => previous.slice(0, index));
    setTrailOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("Trail link copied — it includes every answer you chose.");
    } catch {
      setStatus("Copy the URL in your address bar to share this trail.");
    }
  }
  function handleDialogKeys(
    event: React.KeyboardEvent<HTMLElement>,
    close: () => void,
  ) {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const elements = event.currentTarget.querySelectorAll<HTMLElement>(
      "button:not(:disabled), a[href]",
    );
    const first = elements[0],
      end = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      end.focus();
    } else if (!event.shiftKey && document.activeElement === end) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <div className={`question-journey world-${current.world}`}>
      <div className="journey-background" aria-hidden="true" />
      <header className="journey-nav">
        <button
          className="cinema-brand"
          onClick={onHome}
          aria-label="Rabbit Hole — return to the descent"
        >
          <span className="cinema-logo">
            <i />
            <i />
            <b />
          </span>
          rabbit hole<span className="logo-period">®</span>
        </button>
        <div className="journey-nav-caption">
          <span className="signal-light" /> FOLLOW YOUR ANSWER. FIND YOUR NEXT
          QUESTION.
        </div>
        <button
          className="journey-map-link"
          onClick={() => onMap(current.world, current.idea)}
        >
          <Map size={15} />
          <span>Knowledge map</span>
          <ArrowUpRight size={13} />
        </button>
      </header>
      <main className="journey-layout">
        <section className="question-main" aria-label="Your branching journey">
          <div className="journey-topline">
            <label className="world-picker">
              <span className="sr-only">Starting world</span>
              <select
                value={world}
                onChange={(e) => onWorld(e.target.value as World)}
              >
                <option value="forest">THE FOREST</option>
                <option value="dreams">THE DREAMING MIND</option>
                <option value="ocean">THE DEEP OCEAN</option>
              </select>
              <ChevronDown size={12} />
            </label>
            <span className="journey-step">
              QUESTION {String(steps.length + 1).padStart(3, "0")}{" "}
              <span>/ KEEP GOING</span>
            </span>
          </div>
          <div className="question-stage" key={`${current.id}-${steps.length}`}>
            {last ? (
              <div className="answer-bridge">
                <GitBranch size={16} />
                <div>
                  <span>
                    YOU CHOSE <strong>“{last.answer.text}”</strong>
                  </span>
                  <p>{last.answer.connection}</p>
                </div>
              </div>
            ) : (
              <div className="journey-invitation">
                <span className="signal-light" /> NO SCORE. NO WRONG TURNS. JUST
                YOUR CURIOSITY.
              </div>
            )}
            <span className="question-category">
              {currentTopic.tags[0].toUpperCase()} <span>↗</span>{" "}
              {seen
                ? "A FAMILIAR QUESTION, A NEW PERSPECTIVE"
                : "PULL A THREAD"}
            </span>
            <h1 ref={heading} tabIndex={-1}>
              {current.title}
            </h1>
            <p className="question-hint">{current.hint}</p>
            <div
              className="answer-options"
              role="group"
              aria-label="Choose your answer"
            >
              {current.answers.map((answer, index) => (
                <button
                  key={answer.text}
                  className="answer-option"
                  onClick={() => choose(index)}
                  onPointerEnter={() => setHover(index)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(index)}
                  onBlur={() => setHover(null)}
                >
                  <span className="answer-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{answer.text}</span>
                  <ArrowUpRight size={19} />
                </button>
              ))}
            </div>
            <div className="question-bottom">
              <button
                className="journey-back"
                disabled={!steps.length}
                onClick={() => rewind(steps.length - 1)}
              >
                <ArrowLeft size={15} /> Previous question
              </button>
              <span>
                EVERY ANSWER OPENS ANOTHER DOOR <ArrowRight size={13} />
              </span>
            </div>
          </div>
          {source && (
            <details className="question-context">
              <summary>
                <Sparkles size={13} /> A little context, if you’re curious{" "}
                <PlusOrMinus />
              </summary>
              <p>{source.idea.summary}</p>
              <p>{source.idea.uncertainty}</p>
              <a href={source.idea.source.url} target="_blank" rel="noreferrer">
                {source.idea.source.publisher} <ArrowUpRight size={13} />
              </a>
            </details>
          )}
        </section>
        <aside className="journey-aside" aria-label="Your answer trail">
          <div className="trail-section-label">
            <span>YOUR CURIOSITY, TAKING SHAPE</span>
            <span>FIG. {String(steps.length + 1).padStart(3, "0")}</span>
          </div>
          <JourneyField depth={steps.length} choice={hover} />
          <div className="field-description">
            <span>ONE CHOICE. THREE POSSIBILITIES.</span>
            <span>
              {steps.length} {steps.length === 1 ? "CONNECTION" : "CONNECTIONS"}{" "}
              MADE
            </span>
          </div>
          <div className="live-trail">
            <div className="live-trail-heading">
              <span>
                <GitBranch size={14} /> YOUR TRAIL
              </span>
              <button ref={trailButton} onClick={() => setTrailOpen(true)}>
                View all <ArrowUpRight size={12} />
              </button>
            </div>
            <ol>
              {steps.slice(-3).map((step, index) => (
                <li key={steps.length - Math.min(3, steps.length) + index}>
                  <button
                    onClick={() =>
                      rewind(steps.length - Math.min(3, steps.length) + index)
                    }
                    title="Return to this question and choose another answer"
                  >
                    <span className="trail-node" />
                    <span className="trail-question">
                      {step.question.title}
                      <small>{step.answer.text}</small>
                    </span>
                    <ArrowUpRight size={12} />
                  </button>
                </li>
              ))}
              <li className="trail-current">
                <span className="trail-node" />
                <span>
                  {current.title}
                  <small>YOU ARE HERE</small>
                </span>
              </li>
            </ol>
            <div className="trail-possibilities" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>Where will you go next?</span>
            </div>
          </div>
          <div className="trail-actions">
            <button onClick={share}>
              <Share2 size={13} /> Share trail
            </button>
            <button
              disabled={!steps.length}
              onClick={() => setRestartOpen(true)}
            >
              <RotateCcw size={13} /> Start again
            </button>
          </div>
        </aside>
      </main>
      <footer className="journey-footer">
        <span>
          <span className="signal-light" />
          {storageAvailable
            ? "YOUR TRAIL IS SAVED ON THIS DEVICE"
            : "STORAGE UNAVAILABLE — SHARE YOUR LINK TO KEEP THIS TRAIL"}
        </span>
        <span>CURATED QUESTIONS · PATHS CAN RECONNECT</span>
      </footer>
      {status && (
        <div className="toast" role="status">
          <Check size={16} />
          {status}
        </div>
      )}
      {trailOpen && (
        <div
          className="journey-dialog-backdrop"
          onClick={() => {
            setTrailOpen(false);
            trailButton.current?.focus();
          }}
        >
          <section
            className="journey-dialog trail-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Your complete trail"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) =>
              handleDialogKeys(e, () => {
                setTrailOpen(false);
                trailButton.current?.focus();
              })
            }
          >
            <header>
              <div>
                <span className="cinema-kicker">EVERY TURN YOU TOOK</span>
                <h2>Your trail.</h2>
              </div>
              <button
                ref={trailClose}
                aria-label="Close trail"
                onClick={() => {
                  setTrailOpen(false);
                  trailButton.current?.focus();
                }}
              >
                <X size={21} />
              </button>
            </header>
            <p>
              Return to any question to take a different branch. Choices after
              that point will be replaced.
            </p>
            <ol>
              {steps.map((step, index) => (
                <li key={index}>
                  <button onClick={() => rewind(index)}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      {step.question.title}
                      <small>You chose: {step.answer.text}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                </li>
              ))}
              <li className="dialog-current">
                <span>{String(steps.length + 1).padStart(2, "0")}</span>
                <strong>
                  {current.title}
                  <small>YOUR CURRENT QUESTION</small>
                </strong>
              </li>
            </ol>
          </section>
        </div>
      )}
      {restartOpen && (
        <div
          className="journey-dialog-backdrop"
          onClick={() => setRestartOpen(false)}
        >
          <section
            className="journey-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restart-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) =>
              handleDialogKeys(e, () => {
                setRestartOpen(false);
                heading.current?.focus();
              })
            }
          >
            <span className="cinema-kicker">A DIFFERENT FIRST STEP</span>
            <h2 id="restart-title">Begin a new trail?</h2>
            <p>
              This replaces your saved trail for this starting world. Share the
              current link first if you’d like to keep it.
            </p>
            <div className="dialog-buttons">
              <button
                ref={restartCancel}
                onClick={() => {
                  setRestartOpen(false);
                  heading.current?.focus();
                }}
              >
                Keep exploring
              </button>
              <button
                onClick={() => {
                  setChoices([]);
                  setRestartOpen(false);
                  setTrailOpen(false);
                }}
              >
                Start a new trail <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function PlusOrMinus() {
  return (
    <span className="context-toggle" aria-hidden="true">
      +
    </span>
  );
}
