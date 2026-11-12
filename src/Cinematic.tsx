import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  MoveUpRight,
  Pause,
  Play,
  Plus,
} from "lucide-react";
import { topics } from "./data";
import { questions } from "./questions";
import HeroDiscovery from "./HeroDiscovery";
import Observatory from "./Observatory";
import { createCuriosityScene } from "./curiosity-scene";
import "./cinematic.css";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const worldDescriptions = [
  "An invisible network. A chemical conversation. A world that is more connected than it seems.",
  "Behind closed eyes, your mind builds entire worlds. Follow it beyond the edge of waking.",
  "Below the last light, life finds another way. Descend into Earth’s most unfamiliar frontier.",
];
function WorldArt({ kind }: { kind: number }) {
  return (
    <div className={`world-art world-art-${kind}`} aria-hidden="true">
      <div className="world-orb" />
      <div className="world-orbit one" />
      <div className="world-orbit two" />
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ "--i": i } as React.CSSProperties} />
      ))}
      <div className="world-art-grid" />
      <span className="world-art-cross">+</span>
    </div>
  );
}

export default function Cinematic({
  onEnter,
}: {
  onEnter: (topic: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const navigate = useRef<(target: string | number) => void>(() => {});
  const stageTarget = useRef<(index: number) => void>(() => {});
  const [motion, setMotion] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [activeWorld, setActiveWorld] = useState(0);
  const activeWorldRef = useRef(0);
  const [webgl, setWebgl] = useState(true);
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setSystemReduced(query.matches);
      setMotion(!query.matches);
    };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = root.current!,
      surface = canvas.current!;
    const hero = element.querySelector<HTMLElement>(".descent-hero")!;
    const story = element.querySelector<HTMLElement>(".descent-story")!;
    const reel = element.querySelector<HTMLElement>(".descent-reel")!;
    const track = element.querySelector<HTMLElement>(".world-track")!;
    const viewport = element.querySelector<HTMLElement>(".world-viewport")!;
    const cards = Array.from(
      element.querySelectorAll<HTMLElement>(".world-card"),
    );
    const depth = element.querySelector<HTMLElement>("[data-depth]")!;
    const coordinate = element.querySelector<HTMLElement>("[data-coordinate]")!;
    const clock = element.querySelector<HTMLElement>("[data-clock]")!;
    const chapter = element.querySelector<HTMLElement>("[data-chapter]")!;
    const trace = element.querySelector<SVGPathElement>(".descent-path")!;
    const pathLength = trace.getTotalLength();
    trace.style.strokeDasharray = `${pathLength}`;
    let scene: ReturnType<typeof createCuriosityScene> | undefined;
    let frame = 0,
      disposed = false,
      lastClock = -1,
      lastTime = 0,
      dirty = true;
    let pointerX = 0,
      pointerY = 0,
      easedX = 0,
      easedY = 0,
      dragX = 0,
      dragY = 0,
      easedDragX = 0,
      easedDragY = 0,
      energy = 0;
    let dragging = false,
      lastPointerX = 0,
      lastPointerY = 0;
    let height = window.innerHeight,
      heroTop = 0,
      storyTop = 0,
      reelTop = 0,
      heroSpan = 1,
      storySpan = 1,
      reelSpan = 1,
      total = 1,
      trackTravel = 1;
    const lenis = motion
      ? new Lenis({
          autoRaf: false,
          lerp: 0.085,
          smoothWheel: true,
          anchors: false,
        })
      : undefined;
    try {
      scene = createCuriosityScene(surface);
      setWebgl(true);
    } catch {
      setWebgl(false);
    }
    const resize = () => {
      height = window.innerHeight;
      heroTop = hero.offsetTop;
      storyTop = story.offsetTop;
      reelTop = reel.offsetTop;
      heroSpan = Math.max(1, hero.offsetHeight - height);
      storySpan = Math.max(1, story.offsetHeight - height);
      reelSpan = Math.max(1, reel.offsetHeight - height);
      total = Math.max(1, element.scrollHeight - height);
      trackTravel = Math.max(0, track.scrollWidth - viewport.clientWidth);
      scene?.resize(window.innerWidth, height);
      lenis?.resize();
      dirty = true;
    };
    const scrollTo = (target: string | number) => {
      const destination =
        typeof target === "number"
          ? target
          : (document.getElementById(target)?.offsetTop ?? 0);
      if (lenis) lenis.scrollTo(destination, { duration: 1.4 });
      else window.scrollTo({ top: destination, behavior: "instant" });
    };
    navigate.current = scrollTo;
    stageTarget.current = (index: number) => {
      const i = clamp(index, 0, 2);
      if (!motion) {
        cards[i].scrollIntoView({
          behavior: "instant",
          block: "nearest",
          inline: "center",
        });
        activeWorldRef.current = i;
        setActiveWorld(i);
        return;
      }
      scrollTo(reelTop + (reelSpan * i) / 2);
    };
    const pointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / height) * 2 - 1;
      if (dragging) {
        dragY += (event.clientX - lastPointerX) * 0.008;
        dragX += (event.clientY - lastPointerY) * 0.008;
      }
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      dirty = true;
    };
    const pointerDown = (event: PointerEvent) => {
      if ((event.target as Element).closest(".portal-control")) {
        dragging = true;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        dirty = true;
      }
    };
    const pointerUp = () => {
      dragging = false;
      dirty = true;
    };
    const key = (event: KeyboardEvent) => {
      if (
        (event.target as Element).closest(".portal-control") &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
      ) {
        event.preventDefault();
        dragY +=
          event.key === "ArrowRight"
            ? 0.25
            : event.key === "ArrowLeft"
              ? -0.25
              : 0;
        dragX +=
          event.key === "ArrowDown"
            ? 0.25
            : event.key === "ArrowUp"
              ? -0.25
              : 0;
        dirty = true;
      }
    };
    const scroll = () => {
      dirty = true;
    };
    const nativeReelScroll = () => {
      if (!motion) {
        const index = clamp(
          Math.round(viewport.scrollLeft / (cards[0].offsetWidth + 24)),
          0,
          2,
        );
        if (activeWorldRef.current !== index) {
          activeWorldRef.current = index;
          setActiveWorld(index);
        }
      }
    };
    const contextLost = (e: Event) => {
      e.preventDefault();
      setWebgl(false);
    };
    const contextRestored = () => {
      setWebgl(true);
      dirty = true;
    };
    const frameLoop = (time: number) => {
      if (disposed) return;
      const dt = Math.min(64, time - lastTime || 16.7);
      lastTime = time;
      lenis?.raf(time);
      const y = window.scrollY,
        progress = clamp(y / total);
      const hp = clamp((y - heroTop) / heroSpan),
        sp = clamp((y - storyTop) / storySpan),
        rp = clamp((y - reelTop) / reelSpan);
      const ease = 1 - Math.exp(-dt / 100);
      easedX += (pointerX - easedX) * ease;
      easedY += (pointerY - easedY) * ease;
      easedDragX += (dragX - easedDragX) * ease;
      easedDragY += (dragY - easedDragY) * ease;
      energy += ((dragging ? 1 : 0) - energy) * ease;
      // Only transforms, opacity and text content are mutated during continuous motion.
      // React state changes solely when the discrete selected reel card changes.
      if (motion || dirty) {
        element.style.setProperty("--descent", `${progress}`);
        element.style.setProperty("--hero-shift", `${hp * -115}px`);
        element.style.setProperty(
          "--hero-fade",
          `${1 - clamp((hp - 0.3) / 0.7)}`,
        );
        element.style.setProperty("--story-shift", `${(1 - sp) * 50}px`);
        element.style.setProperty("--story-reveal", `${0.45 + sp * 0.55}`);
        element.style.setProperty(
          "--field-opacity",
          `${y < reelTop ? 1 : 1 - clamp((y - reelTop) / 350) * 0.85}`,
        );
        element.style.setProperty("--field-x", `${easedX * 7}px`);
        trace.style.strokeDashoffset = `${pathLength * (1 - sp)}`;
        if (motion) {
          track.style.transform = `translate3d(${-rp * trackTravel}px,0,0)`;
          cards.forEach((card, i) => {
            const distance = Math.abs(rp * 2 - i);
            card.style.setProperty("--focus", `${1 - clamp(distance) * 0.58}`);
            card.style.setProperty(
              "--card-scale",
              `${1 - clamp(distance) * 0.055}`,
            );
          });
        }
        const index = motion ? Math.round(rp * 2) : activeWorldRef.current;
        if (index !== activeWorldRef.current) {
          activeWorldRef.current = index;
          setActiveWorld(index);
        }
        depth.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")}%`;
        coordinate.textContent = `${easedX >= 0 ? "+" : ""}${easedX.toFixed(2)} / ${easedY >= 0 ? "+" : ""}${easedY.toFixed(2)}`;
        chapter.textContent =
          y < storyTop
            ? "01 — THE QUESTION"
            : y < reelTop
              ? "02 — THE CONNECTION"
              : "03 — THE DISCOVERY";
        scene?.render(
          motion ? progress : 0,
          motion ? easedX : 0,
          motion ? easedY : 0,
          easedDragX,
          easedDragY,
          motion ? energy : 0,
        );
        dirty = false;
      }
      const second = Math.floor(time / 1000);
      if (second !== lastClock) {
        clock.textContent = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/Paris",
        }).format(new Date());
        lastClock = second;
      }
      frame = window.requestAnimationFrame(frameLoop);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        lastTime = 0;
        dirty = true;
        frame = requestAnimationFrame(frameLoop);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    window.addEventListener("keydown", key);
    window.addEventListener("blur", pointerUp);
    document.addEventListener("visibilitychange", visibility);
    viewport.addEventListener("scroll", nativeReelScroll, { passive: true });
    surface.addEventListener("webglcontextlost", contextLost);
    surface.addEventListener("webglcontextrestored", contextRestored);
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    observer.observe(viewport);
    frame = requestAnimationFrame(frameLoop);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      lenis?.destroy();
      scene?.dispose();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("keydown", key);
      window.removeEventListener("blur", pointerUp);
      document.removeEventListener("visibilitychange", visibility);
      viewport.removeEventListener("scroll", nativeReelScroll);
      surface.removeEventListener("webglcontextlost", contextLost);
      surface.removeEventListener("webglcontextrestored", contextRestored);
    };
  }, [motion]);
  function enter(id: string) {
    onEnter(id);
  }
  return (
    <div
      ref={root}
      className={`cinematic ${motion ? "motion-on" : "motion-off"} ${webgl ? "has-webgl" : "no-webgl"}`}
    >
      <a
        className="cinema-skip"
        href="#journey/forest"
        onClick={(e) => {
          e.preventDefault();
          enter("forest");
        }}
      >
        Skip the introduction and start answering
      </a>
      <div className="cinema-atmosphere" aria-hidden="true">
        <div className="cinema-grid" />
        <div className="cinema-haze" />
        <canvas ref={canvas} className="curiosity-canvas" />
        <div className="portal-fallback">
          <i />
          <i />
          <i />
          <span />
        </div>
        <div className="film-grain" />
      </div>
      <header className="cinema-nav">
        <button
          className="cinema-brand"
          aria-label="Rabbit Hole — back to the top"
          onClick={() => navigate.current(0)}
        >
          <span className="cinema-logo">
            <i />
            <i />
            <b />
          </span>
          rabbit hole<span className="logo-period">®</span>
        </button>
        <nav aria-label="Journey navigation">
          <button onClick={() => navigate.current("the-connection")}>
            The idea <ArrowUpRight size={12} />
          </button>
          <button onClick={() => navigate.current("choose-world")}>
            The worlds <ArrowUpRight size={12} />
          </button>
        </nav>
        <button className="cinema-nav-cta" onClick={() => enter("forest")}>
          Try your first question <ArrowUpRight size={15} />
        </button>
      </header>
      <div className="cinema-rail" aria-hidden="true">
        <span>FOLLOW YOUR CURIOSITY</span>
        <div>
          <i />
        </div>
        <span data-depth>000%</span>
      </div>
      <main>
        <Observatory onEnter={enter} onDescend={() => navigate.current("first-question")} />
        <section id="first-question" className="descent-hero" aria-labelledby="cinema-title">
          <div className="cinema-sticky hero-stage">
            <div className="hero-eyebrow">
              <span className="signal-light" /> AN EXPLORATION OF EVERYTHING{" "}
              <span className="eyebrow-line" /> VOL. 001
            </div>
            <div className="cinema-hero-copy">
              <h1 id="cinema-title">
                Curiosity has
                <br />
                <em>no bottom.</em>
                <span className="heading-asterisk" aria-hidden="true">
                  ✳
                </span>
              </h1>
              <p>
                One question opens a door.
                <br />
                What happens when you keep going?
              </p>
              <button
                className="descent-button"
                onClick={() => navigate.current("the-connection")}
              >
                <span>Follow the rabbit</span>
                <span className="round-arrow">
                  <ArrowDown size={20} />
                </span>
              </button>
            </div>
            <HeroDiscovery
              onEnter={(path) => {
                window.history.replaceState(
                  null,
                  "",
                  `#journey/ocean?p=${path}`,
                );
                enter("ocean");
              }}
            />
            <div className="hero-bottom">
              <span>
                <span className="scroll-stem" /> SCROLL TO BEGIN THE DESCENT
              </span>
              <p>
                A little wonder.
                <br />
                <span>Infinite directions.</span>
              </p>
              <span className="hero-index">
                01 <i>/</i> 03
              </span>
            </div>
          </div>
        </section>
        <section
          id="the-connection"
          className="descent-story"
          aria-labelledby="connection-title"
        >
          <div className="cinema-sticky story-stage">
            <div className="story-annotation">
              <span className="signal-light" /> CONNECTIONS ARE EVERYWHERE
              <div className="annotation-coordinates">
                QUESTIONS / {String(questions.length).padStart(3, "0")}
                <br />
                WORLDS / {String(topics.length).padStart(3, "0")}
                <br />
                POSSIBILITIES / ∞
              </div>
            </div>
            <svg
              className="trajectory"
              viewBox="0 0 1000 700"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M100 500C100 200 650 650 500 300S800 100 900 240"
                stroke="#c9e99d"
                strokeOpacity=".08"
              />
              <path
                className="descent-path"
                d="M100 500C100 200 650 650 500 300S800 100 900 240"
                stroke="#c9e99d"
                strokeWidth="1.4"
              />
              <circle cx="900" cy="240" r="5" fill="#cee9a9" />
            </svg>
            <div className="story-copy">
              <span className="cinema-kicker">
                02 / EVERYTHING IS CONNECTED
              </span>
              <h2>
                A forest.
                <br />A dream.
                <br />
                <em>
                  A different way
                  <br />
                  of seeing.
                </em>
              </h2>
              <p>
                The interesting part is never just the answer.
                <br />
                It’s the unexpected connection that leads
                <br className="desktop-only" /> to your next question.
              </p>
              <div className="story-principles">
                <span>
                  <Plus size={13} /> Choose an answer
                </span>
                <span>
                  <Plus size={13} /> Question the evidence
                </span>
                <span>
                  <Plus size={13} /> Find your own way
                </span>
              </div>
              <button
                className="cinema-link"
                onClick={() => navigate.current("choose-world")}
              >
                Find your starting point <ArrowRight size={18} />
              </button>
            </div>
            <span className="story-footnote">
              THINK OF IT AS A FIELD GUIDE FOR YOUR CURIOSITY.
            </span>
          </div>
        </section>
        <section
          id="choose-world"
          className="descent-reel"
          aria-labelledby="worlds-title"
        >
          <div className="cinema-sticky reel-stage">
            <div className="reel-heading">
              <div>
                <span className="cinema-kicker">03 / PICK A THREAD</span>
                <h2>
                  Every question.
                  <br className="mobile-only" /> <em>A new world.</em>
                </h2>
              </div>
              <span className="reel-note">
                Three starting points.
                <br />
                No wrong turns.
              </span>
            </div>
            <div className="world-viewport">
              <div className="world-track">
                {topics.slice(0, 3).map((topic, i) => (
                  <article
                    key={topic.id}
                    className={`world-card world-${i}`}
                    onFocus={() => {
                      if (motion) stageTarget.current(i);
                    }}
                  >
                    <WorldArt kind={i} />
                    <div className="world-card-meta">
                      <span>EXPEDITION / 00{i + 1}</span>
                      <span>
                        {topic.tags[0].toUpperCase()} <MoveUpRight size={12} />
                      </span>
                    </div>
                    <div className="world-card-copy">
                      <span className="world-number">0{i + 1}</span>
                      <h3>{topic.title}</h3>
                      <p>{worldDescriptions[i]}</p>
                      <button onClick={() => enter(topic.id)}>
                        Enter this world <ArrowUpRight size={18} />
                      </button>
                    </div>
                    <span className="world-card-foot">
                      FOLLOW YOUR ANSWERS <span>CURATED · CONNECTED</span>
                    </span>
                  </article>
                ))}
              </div>
            </div>
            <div className="reel-footer">
              <span className="reel-counter">
                0{activeWorld + 1} <span>/ 03</span>
              </span>
              <div className="reel-dots" aria-label="Choose an expedition">
                {topics.slice(0, 3).map((t, i) => (
                  <button
                    key={t.id}
                    aria-label={`Show ${t.short}`}
                    aria-pressed={activeWorld === i}
                    onClick={() => stageTarget.current(i)}
                  >
                    <span />
                  </button>
                ))}
              </div>
              <div className="reel-controls">
                <span>{motion ? "SCROLL TO EXPLORE" : "SWIPE TO EXPLORE"}</span>
                <button
                  aria-label="Previous expedition"
                  disabled={activeWorld === 0}
                  onClick={() =>
                    stageTarget.current(activeWorldRef.current - 1)
                  }
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  aria-label="Next expedition"
                  disabled={activeWorld === 2}
                  onClick={() =>
                    stageTarget.current(activeWorldRef.current + 1)
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="cinema-outro">
          <span className="cinema-kicker">
            THERE’S ALWAYS ANOTHER QUESTION.
          </span>
          <h2>
            Stay curious.
            <br />
            <em>Go a little deeper.</em>
          </h2>
          <button
            className="outro-cta"
            onClick={() => enter(topics[activeWorldRef.current].id)}
          >
            Let’s get wonderfully lost <ArrowUpRight size={24} />
          </button>
          <div className="outro-subjects" aria-label="More subjects">
            <span>OR FOLLOW A DIFFERENT THREAD</span>
            {topics.slice(3).map((topic) => (
              <button key={topic.id} onClick={() => enter(topic.id)}>
                {topic.short}
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
          <div className="outro-facts">
            <span>
              <Check size={13} /> Sources, not just stories
            </span>
            <span>
              <Check size={13} /> Save what stays with you
            </span>
            <span>
              <Check size={13} /> No account needed
            </span>
          </div>
          <footer>
            <span>RABBIT HOLE © {new Date().getFullYear()}</span>
            <span>MADE FOR THE WONDER OF IT.</span>
            <button onClick={() => navigate.current(0)}>
              Back to the surface <ArrowUpRight size={14} />
            </button>
          </footer>
        </section>
      </main>
      <div className="cinema-hud">
        <span>
          <span className="signal-light" />
          <span data-chapter>01 — THE QUESTION</span>
        </span>
        <span className="hud-coordinate">
          POINTER <span data-coordinate>+0.00 / +0.00</span>
        </span>
        <span className="hud-clock">
          <span data-clock>00:00:00</span> PARIS
        </span>
        <button
          onClick={() => setMotion((v) => !v)}
          aria-pressed={motion}
          aria-label={motion ? "Reduce motion" : "Enable motion"}
        >
          {motion ? <Pause size={11} /> : <Play size={11} />}{" "}
          {motion
            ? "MOTION ON"
            : systemReduced
              ? "REDUCED MOTION"
              : "MOTION OFF"}
        </button>
      </div>
    </div>
  );
}
