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
  TreePine,
  Moon,
  Waves,
  Goal,
  Music2,
  Search,
} from "lucide-react";
import { allIdeas, topics } from "./data";
import { questionById, questions, type World } from "./questions";
import {
  discoveredNodes,
  edgeById,
  emptyWeb,
  followAnswer,
  goBack,
  loadWeb,
  selectDiscovered,
  webHash,
  webStorageKey,
} from "./web-state";
import QuestionWeb from "./QuestionWeb";
import "./cinematic.css";
import "./questions.css";
import "./web-journey.css";
import "./web-polish.css";

const subjectIcons = {
  forest: TreePine,
  dreams: Moon,
  ocean: Waves,
  football: Goal,
  music: Music2,
};
const subjectNames = {
  forest: "Nature",
  dreams: "The mind",
  ocean: "Ocean",
  football: "Football",
  music: "Music",
};

export default function WebJourney({
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
  const [state, setState] = useState(() => {
    try {
      return loadWeb(world, window.location.hash, localStorage);
    } catch {
      return loadWeb(world, window.location.hash, { getItem: () => null });
    }
  });
  const [hover, setHover] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState("");
  const subjectRail = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null),
    panel = useRef<HTMLElement>(null);
  const resetCancel = useRef<HTMLButtonElement>(null),
    resetButton = useRef<HTMLButtonElement>(null);
  const listClose = useRef<HTMLButtonElement>(null),
    listButton = useRef<HTMLButtonElement>(null);
  const current = questionById.get(state.selected)!;
  const discovered = useMemo(
    () => discoveredNodes(world, state.edges),
    [world, state.edges],
  );
  const currentTopic = topics.find((t) => t.id === current.world)!;
  const source = allIdeas.find((entry) => entry.idea.id === current.idea);
  const incoming = [...state.edges]
    .reverse()
    .map((id) => edgeById.get(id)!)
    .find(
      (edge) => edge.to === current.id && edge.from === state.history.at(-1),
    );
  const connection = incoming
    ? questionById.get(incoming.from)!.answers[incoming.choice]
    : null;
  useEffect(() => {
    const rail = subjectRail.current;
    const active = rail?.querySelector<HTMLElement>("[aria-current]");
    if (!rail || !active) return;
    rail.scrollLeft +=
      active.getBoundingClientRect().left -
      rail.getBoundingClientRect().left -
      (rail.clientWidth - active.offsetWidth) / 2;
  }, [world]);
  useEffect(() => {
    try {
      localStorage.setItem(webStorageKey(world), JSON.stringify(state));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
    window.history.replaceState(null, "", webHash(world, state));
  }, [world, state]);
  useEffect(() => {
    setHover(null);
    heading.current?.focus({ preventScroll: true });
    panel.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [state.selected]);
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 4000);
    return () => clearTimeout(timer);
  }, [status]);
  useEffect(() => {
    if (resetOpen) resetCancel.current?.focus();
  }, [resetOpen]);
  useEffect(() => {
    if (listOpen) listClose.current?.focus();
  }, [listOpen]);
  useEffect(() => {
    if (!listOpen && !resetOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [listOpen, resetOpen]);
  function revealPanel() {
    if (window.innerWidth <= 800)
      panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  function chooseFrom(from: string, choice: number, fromCanvas = false) {
    setState((previous) =>
      followAnswer(selectDiscovered(world, previous, from), choice),
    );
    if (fromCanvas) revealPanel();
  }
  function select(id: string) {
    setState((previous) => selectDiscovered(world, previous, id));
    setListOpen(false);
    revealPanel();
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(
        new URL(webHash(world, state), window.location.href).href,
      );
      setStatus("Web link copied — every explored branch is included.");
    } catch {
      setStatus("Copy the URL in your address bar to share the entire web.");
    }
  }
  function dialogKeys(
    event: React.KeyboardEvent<HTMLElement>,
    close: () => void,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const elements = event.currentTarget.querySelectorAll<HTMLElement>(
      "button:not(:disabled), a[href], input",
    );
    const first = elements[0],
      last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  const closeList = () => {
    setListOpen(false);
    requestAnimationFrame(() =>
      listButton.current?.focus({ preventScroll: true }),
    );
  };
  const closeReset = () => {
    setResetOpen(false);
    requestAnimationFrame(() =>
      resetButton.current?.focus({ preventScroll: true }),
    );
  };
  return (
    <div className={`question-journey web-experience world-${current.world}`}>
      <div className="web-content" inert={listOpen || resetOpen}>
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
            <span className="signal-light" /> EVERY ANSWER ADDS A THREAD.
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
        <section className="web-intro" aria-label="Exploration controls">
          <div>
            <span className="cinema-kicker">
              FOLLOW ONE THREAD. DISCOVER THE CONNECTIONS.
            </span>
            <h2>
              Your curiosity, <em>connected.</em>
            </h2>
          </div>
          <div className="web-intro-actions">
            <label className="world-picker">
              <span className="sr-only">Starting world</span>
              <select
                value={world}
                onChange={(e) => onWorld(e.target.value as World)}
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {subjectNames[topic.id as World].toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} />
            </label>
            <button className="web-share" onClick={share}>
              <Share2 size={14} /> Share web
            </button>
          </div>
        </section>
        <nav
          ref={subjectRail}
          className="subject-rail"
          aria-label="Explore subjects"
        >
          {topics.map((topic) => {
            const id = topic.id as World;
            const Icon = subjectIcons[id];
            return (
              <button
                key={id}
                aria-current={world === id ? "page" : undefined}
                onClick={() => {
                  if (world !== id) onWorld(id);
                }}
              >
                <Icon size={17} />
                <span>{subjectNames[id]}</span>
                <small>
                  {questions.filter((q) => q.world === id).length} questions
                </small>
                {(id === "football" || id === "music") && <b>NEW</b>}
              </button>
            );
          })}
        </nav>
        <main className="web-workspace">
          <QuestionWeb
            world={world}
            state={state}
            onSelect={select}
            onAnswer={(from, choice) => chooseFrom(from, choice, true)}
            hovered={hover}
          />
          <aside
            className="web-question-panel"
            ref={panel}
            aria-label="Selected question and answers"
          >
            <div className="web-panel-heading">
              <span>
                <GitBranch size={14} /> CHOOSE A BRANCH
              </span>
              <span>
                {
                  state.edges.filter((id) => id.startsWith(`${current.id}:`))
                    .length
                }{" "}
                / 3 EXPLORED
              </span>
            </div>
            <div className="branch-progress" aria-hidden="true">
              {current.answers.map((_, index) => (
                <i
                  key={index}
                  className={
                    state.edges.includes(`${current.id}:${index}`)
                      ? "is-complete"
                      : ""
                  }
                />
              ))}
            </div>
            <section className="question-stage" key={current.id}>
              <span className="question-category">
                {currentTopic.tags[0].toUpperCase()} <ArrowUpRight size={10} />{" "}
                {current.id === world
                  ? "YOUR STARTING POINT"
                  : "A QUESTION IN YOUR WEB"}
              </span>
              <h1 ref={heading} tabIndex={-1}>
                {current.title}
              </h1>
              <p className="question-hint">{current.hint}</p>
              {connection && (
                <div className="answer-bridge">
                  <GitBranch size={14} />
                  <div>
                    <span>
                      CONNECTED THROUGH <strong>“{connection.text}”</strong>
                    </span>
                    <p>{connection.connection}</p>
                  </div>
                </div>
              )}
              <div
                className="answer-options"
                role="group"
                aria-label="Choose your answer"
              >
                {current.answers.map((answer, index) => {
                  const followed = state.edges.includes(
                    `${current.id}:${index}`,
                  );
                  return (
                    <button
                      key={answer.text}
                      className={`answer-option ${followed ? "branch-explored" : ""}`}
                      onClick={() => chooseFrom(current.id, index)}
                      onPointerEnter={() => setHover(index)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(index)}
                      onBlur={() => setHover(null)}
                    >
                      <span className="answer-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>
                        {answer.text}
                        {followed && <small>ALREADY IN YOUR WEB</small>}
                      </span>
                      {followed ? (
                        <Check size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="web-branch-help">
                <Sparkles size={12} /> Every branch stays. Return to any
                question and try another answer.
              </p>
              <div className="branch-preview">
                <span>
                  <ArrowUpRight size={12} />{" "}
                  {hover === null
                    ? "ONE POSSIBLE NEXT QUESTION"
                    : `FOLLOW ANSWER ${String.fromCharCode(65 + hover)}`}
                </span>
                <p>
                  {questionById.get(current.answers[hover ?? 0].next)!.title}
                </p>
              </div>
              <button
                className="journey-back"
                disabled={!state.history.length}
                onClick={() => setState((previous) => goBack(previous))}
              >
                <ArrowLeft size={14} /> Previous question
              </button>
            </section>
            {source && (
              <details
                className="question-context"
                key={`context-${current.id}`}
              >
                <summary>
                  <Sparkles size={13} /> A little context{" "}
                  <span className="context-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{source.idea.summary}</p>
                <p>{source.idea.uncertainty}</p>
                <a
                  href={source.idea.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.idea.source.publisher}
                  <ArrowUpRight size={13} />
                </a>
              </details>
            )}
            <div className="web-panel-actions">
              <button
                ref={listButton}
                onClick={() => {
                  setSearch("");
                  setListOpen(true);
                }}
              >
                <GitBranch size={13} /> All {discovered.size} questions
              </button>
              <button
                ref={resetButton}
                disabled={!state.edges.length}
                onClick={() => setResetOpen(true)}
              >
                <RotateCcw size={13} /> New web
              </button>
            </div>
          </aside>
        </main>
        {!listOpen && !resetOpen && (
          <nav
            className="mobile-web-dock"
            aria-label="Jump between web and question"
          >
            <button
              onClick={() => {
                const map = document.getElementById("question-web");
                map?.scrollIntoView({ block: "start", behavior: "instant" });
                map
                  ?.querySelector<HTMLElement>(".web-viewport")
                  ?.focus({ preventScroll: true });
              }}
            >
              <GitBranch size={17} />
              <span>
                View web<small>{discovered.size} questions connected</small>
              </span>
            </button>
            <button
              onClick={() => {
                panel.current?.scrollIntoView({
                  block: "start",
                  behavior: "instant",
                });
                heading.current?.focus({ preventScroll: true });
              }}
            >
              <ArrowRight size={17} />
              <span>
                Answer question<small>Follow your next thread</small>
              </span>
            </button>
          </nav>
        )}
        <footer className="journey-footer">
          <span>
            <span className="signal-light" />
            {storageAvailable
              ? "YOUR ENTIRE WEB IS SAVED ON THIS DEVICE"
              : "STORAGE UNAVAILABLE — SHARE THE LINK TO KEEP YOUR WEB"}
          </span>
          <span>QUESTIONS CAN RECONNECT · YOUR BRANCHES STAY</span>
        </footer>
        {status && (
          <div className="toast" role="status">
            <Check size={16} />
            {status}
          </div>
        )}
      </div>
      {listOpen && (
        <div className="journey-dialog-backdrop" onClick={closeList}>
          <section
            className="journey-dialog web-question-list"
            role="dialog"
            aria-modal="true"
            aria-label="All discovered questions"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => dialogKeys(e, closeList)}
          >
            <header>
              <div>
                <span className="cinema-kicker">EVERY QUESTION YOU OPENED</span>
                <h2>Your whole web.</h2>
              </div>
              <button
                ref={listClose}
                aria-label="Close questions"
                onClick={closeList}
              >
                <X size={21} />
              </button>
            </header>
            <p>Jump to any question. All your other branches stay connected.</p>
            <label className="web-search">
              <Search size={16} />
              <input
                aria-label="Search discovered questions"
                placeholder="Find a question in your web…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <ul>
              {[...discovered]
                .filter((id) =>
                  questionById
                    .get(id)!
                    .title.toLowerCase()
                    .includes(search.trim().toLowerCase()),
                )
                .map((id) => (
                  <li key={id}>
                    <button
                      onClick={() => select(id)}
                      aria-current={id === current.id ? "true" : undefined}
                    >
                      <span className="web-list-dot" />
                      <span>
                        {questionById.get(id)!.title}
                        <small>
                          {
                            state.edges.filter((edge) =>
                              edge.startsWith(`${id}:`),
                            ).length
                          }{" "}
                          of 3 branches explored
                        </small>
                      </span>
                      <ArrowUpRight size={15} />
                    </button>
                  </li>
                ))}
            </ul>
            {![...discovered].some((id) =>
              questionById
                .get(id)!
                .title.toLowerCase()
                .includes(search.trim().toLowerCase()),
            ) && <p role="status">No questions match. Try another word.</p>}
          </section>
        </div>
      )}
      {resetOpen && (
        <div className="journey-dialog-backdrop" onClick={closeReset}>
          <section
            className="journey-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-web-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => dialogKeys(e, closeReset)}
          >
            <span className="cinema-kicker">A NEW FIRST THREAD</span>
            <h2 id="new-web-title">Start a new web?</h2>
            <p>
              This replaces the saved web for this starting world. Share its
              link first if you’d like to keep all its branches.
            </p>
            <div className="dialog-buttons">
              <button ref={resetCancel} onClick={closeReset}>
                Keep exploring
              </button>
              <button
                onClick={() => {
                  setState(emptyWeb(world));
                  setResetOpen(false);
                  heading.current?.focus();
                }}
              >
                Start a new web <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
