import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Columns2,
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
import Discovery from "./Discovery";
import JourneyStory from "./JourneyStory";
import "./cinematic.css";
import "./questions.css";
import "./web-journey.css";
import "./web-polish.css";
import "./discovery.css";
import "./usability.css";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

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
  savedIds,
  onSave,
}: {
  world: World;
  onHome: () => void;
  onMap: (world: World, idea: string) => void;
  onWorld: (world: World) => void;
  savedIds: string[];
  onSave: (id: string) => void;
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
  const [discovering, setDiscovering] = useState(() => {
    try {
      return (
        localStorage.getItem(`rh-discovery-${world}`) === webHash(world, state)
      );
    } catch {
      return false;
    }
  });
  const [mapExpanded, setMapExpanded] = useState(false);
  useEffect(() => {
    try {
      if (discovering)
        localStorage.setItem(`rh-discovery-${world}`, webHash(world, state));
      else localStorage.removeItem(`rh-discovery-${world}`);
    } catch {
      /* The exploration remains usable without storage. */
    }
  }, [discovering, world, state]);
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
  function revealPanel(always = false) {
    const element = panel.current;
    if (!element) return;
    // On small screens the panel is below the map; on larger screens it may
    // have been scrolled past while reading a long discovery. Either way, bring
    // the top of the next step back into view so the heading is never cut off.
    if (
      always ||
      window.innerWidth <= 800 ||
      element.getBoundingClientRect().top < 0
    )
      element.scrollIntoView({ block: "start", behavior: "instant" });
  }
  function continueToChoice() {
    setDiscovering(false);
    requestAnimationFrame(() => {
      revealPanel();
      heading.current?.focus({ preventScroll: true });
    });
  }
  function chooseFrom(from: string, choice: number, fromCanvas = false) {
    setState((previous) =>
      followAnswer(selectDiscovered(world, previous, from), choice),
    );
    setDiscovering(true);
    setMapExpanded(false);
    requestAnimationFrame(() => revealPanel(fromCanvas));
  }
  // Answer with A/B/C or 1/2/3 while choosing; skip when typing or a dialog is open.
  useEffect(() => {
    if (discovering || listOpen || resetOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat)
        return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]"))
        return;
      const index = ["a", "b", "c"].indexOf(event.key.toLowerCase());
      const digit = ["1", "2", "3"].indexOf(event.key);
      const choice = index >= 0 ? index : digit;
      if (choice < 0 || choice >= current.answers.length) return;
      event.preventDefault();
      chooseFrom(current.id, choice);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  function select(id: string) {
    setState((previous) => selectDiscovered(world, previous, id));
    setListOpen(false);
    setDiscovering(true);
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
    <div
      className={`question-journey web-experience discovery-experience world-${current.world} ${mapExpanded ? "map-expanded" : ""}`}
    >
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
          <div className="journey-nav-actions">
            <button className="web-share" onClick={share}>
              <Share2 size={14} /> Share web
            </button>
            <button
              className="journey-map-link"
              onClick={() => onMap(current.world, current.idea)}
              title="Browse every topic as a reading map"
            >
              <Map size={15} />
              <span>Knowledge map</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </header>
        <div className="journey-toolbar">
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
                    {plural(
                      questions.filter((q) => q.world === id).length,
                      "question",
                    )}
                  </small>
                  {(id === "football" || id === "music") && <b>NEW</b>}
                </button>
              );
            })}
          </nav>
          <nav className="journey-views" aria-label="Journey views">
            <button
              aria-pressed={!mapExpanded}
              onClick={() => {
                setMapExpanded(false);
                revealPanel(true);
              }}
            >
              <Columns2 size={15} /> Question view
            </button>
            <button
              aria-pressed={mapExpanded}
              onClick={() => {
                setMapExpanded(true);
                requestAnimationFrame(() =>
                  document
                    .getElementById("question-web")
                    ?.scrollIntoView({ block: "center", behavior: "instant" }),
                );
              }}
            >
              <Map size={15} /> Big map · {plural(discovered.size, "question")}
            </button>
          </nav>
        </div>
        <main className="web-workspace">
          <QuestionWeb
            world={world}
            state={state}
            onSelect={select}
            onAnswer={(from, choice) => chooseFrom(from, choice, true)}
            hovered={hover}
            compact={!mapExpanded}
            savedIdeas={savedIds}
            highlighted={
              discovering &&
              incoming &&
              questionById.get(incoming.from)!.world !== current.world
                ? [incoming.from, current.id]
                : []
            }
          />
          <aside
            className="web-question-panel"
            ref={panel}
            aria-label="Selected question and answers"
          >
            {discovering && (
              <Discovery
                key={current.id}
                question={current}
                from={incoming?.from}
                connection={connection?.connection}
                saved={savedIds.includes(current.idea)}
                onSave={onSave}
                onContinue={continueToChoice}
              />
            )}
            <div hidden={discovering} className="question-choice-content">
              <ol className="journey-steps" aria-label="Progress">
                <li aria-current="step">
                  <b>1</b> Pick an answer
                </li>
                <li>
                  {state.edges.length > 0 ? (
                    <button
                      type="button"
                      className="journey-step-link"
                      onClick={() => setDiscovering(true)}
                    >
                      <b>2</b> See what you found
                    </button>
                  ) : (
                    <>
                      <b>2</b> See what you found
                    </>
                  )}
                </li>
                <li className="journey-steps-count">
                  {
                    state.edges.filter((id) => id.startsWith(`${current.id}:`))
                      .length
                  }{" "}
                  of 3 answers tried here
                </li>
              </ol>
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
                  {currentTopic.tags[0].toUpperCase()}{" "}
                  <ArrowUpRight size={10} />{" "}
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
                  <Sparkles size={12} />
                  <span>
                    There’s no wrong answer — pick the one closest to your
                    instinct.{" "}
                    <span className="kbd-hint">
                      Press <kbd>A</kbd> <kbd>B</kbd> or <kbd>C</kbd> to
                      answer.
                    </span>
                    {!state.edges.length &&
                      " You can always come back and try the others."}
                  </span>
                </p>
                <div className="branch-preview">
                  <span>
                    <ArrowUpRight size={12} />{" "}
                    {`Answer ${String.fromCharCode(65 + (hover ?? 0))} leads to`}
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
            </div>
            {!discovering && source && (
              <details
                className="question-context"
                key={`context-${current.id}`}
              >
                <summary>
                  <Sparkles size={13} /> What the evidence says{" "}
                  <span className="context-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{source.idea.summary}</p>
                <p>{source.idea.body}</p>
                <p>{source.idea.uncertainty}</p>
                <a
                  href={source.idea.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.idea.source.publisher}
                  <ArrowUpRight size={13} />
                </a>
                <button
                  className="inline-discovery"
                  onClick={() => setDiscovering(true)}
                >
                  Open discovery & experiment →
                </button>
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
            {state.edges.length > 0 && (
              <JourneyStory world={world} state={state} />
            )}
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
                View web<small>{plural(discovered.size, "question")} connected</small>
              </span>
            </button>
            <button
              onClick={() => {
                if (discovering) {
                  continueToChoice();
                  return;
                }
                panel.current?.scrollIntoView({
                  block: "start",
                  behavior: "instant",
                });
                heading.current?.focus({ preventScroll: true });
              }}
            >
              <ArrowRight size={17} />
              <span>
                Answer question
                <small>
                  {discovering ? "Skip to the next choice" : "Pick A, B or C"}
                </small>
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
                  setDiscovering(false);
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
