import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Download,
  Expand,
  FlaskConical,
  GitBranch,
  Globe2,
  Leaf,
  Menu,
  Minus,
  Moon,
  Network,
  Plus,
  Search,
  Share2,
  Sparkles,
  TreePine,
  Waves,
  X,
  Eye,
} from "lucide-react";
import { allIdeas, topics, type Idea, type Topic } from "./data";
import type { World } from "./questions";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "./styles.css";
const Cinematic = lazy(() => import("./Cinematic"));
const QuestionJourney = lazy(() => import("./WebJourney"));
const icons = {
  tree: TreePine,
  network: Network,
  flask: FlaskConical,
  moon: Moon,
  spark: Sparkles,
  waves: Waves,
  eye: Eye,
};
type Saved = { id: string; note: string };
function readStored<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}
function RabbitMark({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 24 : 32}
      height={small ? 28 : 38}
      viewBox="0 0 32 38"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 19C6 10 5 1 9 2c4 1 6 11 7 16C17 9 20 0 23 2c4 3-1 13-3 18 6 4 7 11 2 14-5 4-14 2-16-3-2-5 1-9 6-12Z"
        fill="currentColor"
      />
      <circle cx="21" cy="26" r="1.5" fill="var(--sidebar)" />
    </svg>
  );
}
function App() {
  const [journey, setJourney] = useState<World | null>(
    () =>
      (window.location.hash.match(
        /^#journey\/(forest|dreams|ocean)(?:\?|$)/,
      )?.[1] as World) || null,
  );
  const [landing, setLanding] = useState(
    () =>
      !journey &&
      !topics.some((t) => window.location.hash.startsWith(`#${t.id}/`)),
  );
  const initial = () => {
    const [t, n] = window.location.hash.slice(1).split("/");
    const topic = topics.find((v) => v.id === t) || topics[0];
    return {
      topic,
      node: topic.nodes.find((v) => v.id === n) || topic.nodes[0],
    };
  };
  const [topic, setTopic] = useState<Topic>(initial().topic);
  const [selected, setSelected] = useState<Idea>(initial().node);
  const [view, setView] = useState<"explore" | "saved">("explore");
  const [saved, setSaved] = useState<Saved[]>(() =>
    readStored("rh-saved", []).filter(
      (x: Saved) => x && typeof x.id === "string" && typeof x.note === "string",
    ),
  );
  const [visited, setVisited] = useState<string[]>(() =>
    readStored("rh-visited", []),
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [detailOpen, setDetailOpen] = useState(() =>
    Boolean(window.location.hash.split("/")[1]),
  );
  const [detailTab, setDetailTab] = useState<"story" | "evidence">("story");
  const searchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem("rh-saved", JSON.stringify(saved));
      localStorage.setItem("rh-visited", JSON.stringify(visited));
    } catch {
      setToast(
        "Storage is unavailable. Your changes will last for this visit.",
      );
    }
  }, [saved, visited]);
  useEffect(() => {
    if (landing || journey) return;
    setVisited((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
    window.history.replaceState(null, "", `#${topic.id}/${selected.id}`);
  }, [selected, topic, landing, journey]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setDetailOpen(false);
        setMobileNav(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  function chooseTopic(t: Topic, n?: Idea) {
    if (landing || journey) window.scrollTo({ top: 0, behavior: "instant" });
    setLanding(false);
    setJourney(n ? null : (t.id as World));
    setTopic(t);
    setSelected(n || t.nodes[0]);
    setView("explore");
    setZoom(1);
    setSearchOpen(false);
    setQuery("");
    setMobileNav(false);
    setDetailTab("story");
    setDetailOpen(Boolean(n));
  }
  function selectNode(n: Idea) {
    setSelected(n);
    setDetailOpen(true);
    setDetailTab("story");
  }
  function toggleSave(id: string) {
    setSaved((v) =>
      v.some((s) => s.id === id)
        ? v.filter((s) => s.id !== id)
        : [...v, { id, note: "" }],
    );
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Link copied. Take someone down this rabbit hole.");
    } catch {
      setToast("Copy the URL in your address bar to share this idea.");
    }
  }
  function exportNotes() {
    const text = [
      "# My Rabbit Hole field notes",
      "",
      ...saved.flatMap((s) => {
        const entry = allIdeas.find((e) => e.idea.id === s.id);
        return entry
          ? [
              `## ${entry.idea.title}`,
              entry.idea.summary,
              `Source: ${entry.idea.source.url}`,
              s.note ? `My note: ${s.note}` : "",
              "",
            ]
          : [];
      }),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "rabbit-hole-field-notes.md";
    a.click();
    URL.revokeObjectURL(url);
  }
  const isSaved = saved.some((s) => s.id === selected.id);
  const progress = topic.nodes.filter((n) => visited.includes(n.id)).length;
  const results = query.trim()
    ? allIdeas.filter(({ idea, topic: t }) =>
        `${idea.title} ${idea.summary} ${idea.category} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
      )
    : [];
  const related = topic.nodes.filter(
    (n) => n.parent === selected.id || n.id === selected.parent,
  );
  const Icon = icons[selected.icon];
  if (landing)
    return (
      <Suspense
        fallback={<div className="cinema-loading">FOLLOW YOUR CURIOSITY</div>}
      >
        <Cinematic
          onEnter={(id) =>
            chooseTopic(topics.find((t) => t.id === id) || topics[0])
          }
        />
      </Suspense>
    );
  if (journey)
    return (
      <Suspense
        fallback={<div className="cinema-loading">FOLLOW YOUR CURIOSITY</div>}
      >
        <QuestionJourney
          key={journey}
          world={journey}
          onWorld={(id) => chooseTopic(topics.find((t) => t.id === id)!)}
          onHome={() => {
            setJourney(null);
            setLanding(true);
            window.history.replaceState(null, "", window.location.pathname);
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          onMap={(id, ideaId) => {
            const t = topics.find((t) => t.id === id)!;
            chooseTopic(t, t.nodes.find((n) => n.id === ideaId) || t.nodes[0]);
          }}
        />
      </Suspense>
    );
  return (
    <div className="app-shell">
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            chooseTopic(topics[0]);
          }}
        >
          <RabbitMark />
          <span>
            rabbit hole<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="sidebar-caption">
          A LITTLE CURIOSITY GOES A LONG WAY
        </div>
        <button className="search-trigger" onClick={() => setSearchOpen(true)}>
          <Search size={17} />
          <span>Find your next question</span>
          <kbd>⌘ K</kbd>
        </button>
        <nav aria-label="Main navigation">
          <button className="nav-item" onClick={() => chooseTopic(topic)}>
            <GitBranch size={18} /> Answer a question <ArrowUpRight size={13} />
          </button>
          <button
            className={view === "explore" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setView("explore");
              setMobileNav(false);
            }}
          >
            <Compass size={19} /> Explore <span className="nav-dot" />
          </button>
          <button
            className={view === "saved" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setView("saved");
              setMobileNav(false);
            }}
          >
            <Bookmark size={18} /> My collection{" "}
            <span className="count">{saved.length}</span>
          </button>
        </nav>
        <div className="nav-section-title">
          YOUR TRAILS <span>03</span>
        </div>
        <div className="trails">
          {topics.map((t, i) => (
            <button
              key={t.id}
              className={`trail ${topic.id === t.id && view === "explore" ? "current" : ""}`}
              onClick={() => chooseTopic(t)}
            >
              <span className={`trail-line trail-${i}`} />
              <span>{t.short}</span>
              <ChevronRight size={14} />
            </button>
          ))}
        </div>
        <button
          className="back-to-descent"
          onClick={() => {
            window.history.replaceState(null, "", window.location.pathname);
            setLanding(true);
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        >
          <ArrowUpRight size={16} /> Return to the descent
        </button>
        <div className="sidebar-bottom">
          <div className="curiosity-card">
            <span className="mini-stars">✧</span>
            <p>
              The best discoveries
              <br />
              start with <em>“what if?”</em>
            </p>
            <button
              onClick={() => {
                const next =
                  topics[
                    (topics.findIndex((t) => t.id === topic.id) + 1) %
                      topics.length
                  ];
                chooseTopic(next);
              }}
            >
              Surprise me <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="local-profile">
            <div className="avatar">Y</div>
            <div>
              <strong>Your curious corner</strong>
              <span>Saved on this device</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <Globe2 size={16} />
            <span>Your curiosity, connected</span>
          </div>
          <div className="topbar-right">
            <span className="edition">AN INTERNET WORTH EXPLORING</span>
            <span className="beta">BETA 01</span>
          </div>
        </header>
        {view === "explore" ? (
          <>
            <section className="intro">
              <div>
                <div className="eyebrow">
                  <span />
                  FOLLOW A QUESTION. FIND A WORLD.
                </div>
                <h1>
                  A little wonder.
                  <br className="mobile-break" />{" "}
                  <span>Endless possibilities.</span>
                </h1>
                <p>
                  Pick a thread. Follow the connections. See where your
                  curiosity takes you.
                </p>
              </div>
              <button
                className="new-question"
                onClick={() => setSearchOpen(true)}
              >
                <Plus size={17} /> Find a rabbit hole
              </button>
            </section>
            <div className="exploration-heading">
              <div className="exploration-label">
                <span className={`topic-symbol ${topic.accent}`}>
                  <Leaf size={17} />
                </span>
                <div>
                  <span className="overline">YOU’RE EXPLORING</span>
                  <h2>{topic.short}</h2>
                </div>
              </div>
              <div className="exploration-actions">
                <span className="live-label">
                  <span /> {progress} of {topic.nodes.length} ideas explored
                </span>
                <button className="text-button" onClick={share}>
                  <Share2 size={15} />
                  <span>Share trail</span>
                </button>
              </div>
            </div>
            <section
              className={`exploration-workspace ${topic.accent}`}
              aria-label="Interactive exploration"
            >
              <div className="map-section">
                <div className="map-top">
                  <span>
                    <GitBranch size={14} /> THE CURIOSITY MAP
                  </span>
                  <span className="map-hint">
                    Every connection is a new beginning
                  </span>
                </div>
                <div className="map-scroll" ref={mapRef}>
                  <div
                    className="map-canvas"
                    style={{
                      width: `${100 * zoom}%`,
                      minWidth: 560 * zoom,
                      height: 660 * zoom,
                    }}
                  >
                    <svg
                      className="connections"
                      viewBox="0 0 1100 800"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <pattern
                          id="dots"
                          x="0"
                          y="0"
                          width="28"
                          height="28"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle
                            cx="1"
                            cy="1"
                            r="1"
                            fill="#a0aa92"
                            opacity=".32"
                          />
                        </pattern>
                      </defs>
                      <rect width="1100" height="800" fill="url(#dots)" />
                      {topic.nodes
                        .filter((n) => n.parent)
                        .map((n) => {
                          const p = topic.nodes.find((v) => v.id === n.parent)!;
                          const x1 = p.x + 90,
                            y1 = p.y + 40,
                            x2 = n.x + 90,
                            y2 = n.y + 40;
                          return (
                            <g key={n.id}>
                              <path
                                d={`M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`}
                                fill="none"
                                stroke={
                                  n.id === selected.id || p.id === selected.id
                                    ? "#879669"
                                    : "#c9cfbf"
                                }
                                strokeWidth="1.6"
                                strokeDasharray={
                                  n.id === "intelligence" ||
                                  n.id === "alien" ||
                                  n.id === "dream-self"
                                    ? "5 5"
                                    : undefined
                                }
                              />
                              <circle
                                cx={(x1 + x2) / 2}
                                cy={(y1 + y2) / 2}
                                r="3"
                                fill="#a3ae90"
                              />
                            </g>
                          );
                        })}
                    </svg>
                    <span className="map-caption caption-left">
                      there’s more beneath
                      <br />
                      the surface… <ArrowDown size={22} />
                    </span>
                    <span className="map-caption caption-right">
                      what if we look
                      <br />a little closer?
                    </span>
                    {topic.nodes.map((n, i) => {
                      const NodeIcon = icons[n.icon];
                      const active = n.id === selected.id;
                      return (
                        <button
                          key={n.id}
                          aria-pressed={active}
                          className={`idea-node ${i === 0 ? "root-node" : ""} ${active ? "selected" : ""} ${visited.includes(n.id) ? "visited" : ""}`}
                          style={{ left: `${n.x / 11}%`, top: `${n.y / 8}%` }}
                          onClick={() => selectNode(n)}
                        >
                          <span className="node-icon">
                            <NodeIcon size={i === 0 ? 26 : 20} />
                          </span>
                          <span className="node-label">{n.label}</span>
                          <strong>{n.title}</strong>
                          <span className="node-footer">
                            {i === 0 ? "START HERE" : n.category}
                            <span>
                              {visited.includes(n.id) ? (
                                <Check size={12} />
                              ) : (
                                <ArrowUpRight size={12} />
                              )}
                            </span>
                          </span>
                          {active && <span className="selected-indicator" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="map-bottom">
                  <span className="map-legend">
                    <span /> A question worth following
                  </span>
                  <div className="map-controls">
                    <button
                      aria-label="Zoom out"
                      disabled={zoom <= 0.8}
                      onClick={() =>
                        setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))
                      }
                    >
                      <Minus size={16} />
                    </button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button
                      aria-label="Zoom in"
                      disabled={zoom >= 1.8}
                      onClick={() =>
                        setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(1)))
                      }
                    >
                      <Plus size={16} />
                    </button>
                    <span className="control-divider" />
                    <button
                      aria-label="Reset map view"
                      onClick={() => {
                        setZoom(1);
                        mapRef.current?.scrollTo({
                          left: 0,
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                    >
                      <Expand size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <aside
                className={`detail-panel ${detailOpen ? "detail-open" : ""}`}
                aria-label="Selected idea"
              >
                <button
                  className="close-detail icon-button"
                  aria-label="Close idea"
                  onClick={() => setDetailOpen(false)}
                >
                  <X size={20} />
                </button>
                <div className={`detail-art ${topic.accent}`}>
                  <div className="art-orbit orbit-one" />
                  <div className="art-orbit orbit-two" />
                  <div className="art-orbit orbit-three" />
                  <div className="art-grain" />
                  {topic.id === "forest" ? (
                    <ForestArt />
                  ) : topic.id === "dreams" ? (
                    <Moon size={100} strokeWidth={0.7} />
                  ) : (
                    <Waves size={130} strokeWidth={0.65} />
                  )}
                  <span className="art-tag">
                    <Icon size={12} />
                    {selected.category.toUpperCase()}
                  </span>
                  <span className="art-coordinate">
                    {String(topic.nodes.indexOf(selected) + 1).padStart(2, "0")}{" "}
                    / 06
                  </span>
                </div>
                <div className="detail-content">
                  <div className="detail-eyebrow">
                    <span className="green-dot" /> A THREAD TO FOLLOW{" "}
                    <span>3 MIN READ</span>
                  </div>
                  <h2>{selected.title}</h2>
                  <p className="detail-summary">{selected.summary}</p>
                  <div
                    className="detail-tabs"
                    role="tablist"
                    aria-label="Idea details"
                  >
                    <button
                      role="tab"
                      aria-selected={detailTab === "story"}
                      onClick={() => setDetailTab("story")}
                    >
                      The story
                    </button>
                    <button
                      role="tab"
                      aria-selected={detailTab === "evidence"}
                      onClick={() => setDetailTab("evidence")}
                    >
                      Evidence & questions <span>1</span>
                    </button>
                  </div>
                  {detailTab === "story" ? (
                    <div className="story-body">
                      <p>{selected.body}</p>
                      <div className="wonder-box">
                        <Sparkles size={17} />
                        <div>
                          <strong>Stay curious. Stay critical.</strong>
                          <p>{selected.uncertainty}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="evidence-body">
                      <div className="source-card">
                        <span>READ THE SOURCE</span>
                        <a
                          href={selected.source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {selected.source.title}
                          <ArrowUpRight size={17} />
                        </a>
                        <p>{selected.source.publisher}</p>
                      </div>
                      <h3>What could change the answer?</h3>
                      <p>{selected.uncertainty}</p>
                      <small>
                        These are curated summaries. Follow the source to
                        inspect the original evidence and its limits.
                      </small>
                    </div>
                  )}
                  <div className="detail-buttons">
                    <button
                      className={`save-button ${isSaved ? "is-saved" : ""}`}
                      onClick={() => toggleSave(selected.id)}
                    >
                      {isSaved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
                      {isSaved ? "Saved to collection" : "Save this idea"}
                    </button>
                    <button
                      className="icon-button source-link"
                      aria-label="Read original source"
                      onClick={() => setDetailTab("evidence")}
                    >
                      <BookOpen size={18} />
                    </button>
                  </div>
                  {related.length > 0 && (
                    <div className="follow-thread">
                      <span className="overline">PULL ANOTHER THREAD</span>
                      {related.slice(0, 2).map((n) => (
                        <button key={n.id} onClick={() => selectNode(n)}>
                          {n.title}
                          <ArrowRight size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </section>
            <footer className="explore-footer">
              <span>
                <Sparkles size={14} /> Knowledge isn’t a straight line. Enjoy
                the detour.
              </span>
              <button
                onClick={() =>
                  chooseTopic(
                    topics[(topics.indexOf(topic) + 1) % topics.length],
                  )
                }
              >
                A different rabbit hole <ArrowRight size={15} />
              </button>
            </footer>
          </>
        ) : (
          <section className="collection">
            <div className="eyebrow">
              <span />
              YOUR PERSONAL FIELD NOTES
            </div>
            <div className="collection-header">
              <div>
                <h1>
                  Keep the <em>interesting bits.</em>
                </h1>
                <p>
                  Ideas worth coming back to. Connections only you would make.
                </p>
              </div>
              <button
                className="new-question"
                disabled={!saved.length}
                onClick={exportNotes}
              >
                <Download size={17} /> Export notes
              </button>
            </div>
            {!saved.length ? (
              <div className="empty-state">
                <Bookmark size={36} strokeWidth={1} />
                <h2>Your next discovery belongs here.</h2>
                <p>Save an idea from the map to start your collection.</p>
                <button
                  className="primary-button"
                  onClick={() => setView("explore")}
                >
                  Follow your curiosity <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="saved-grid">
                {saved.map((s) => {
                  const entry = allIdeas.find((e) => e.idea.id === s.id);
                  if (!entry) return null;
                  const SavedIcon = icons[entry.idea.icon];
                  return (
                    <article className="saved-card" key={s.id}>
                      <div className="saved-card-top">
                        <span>
                          <SavedIcon size={20} />
                          {entry.idea.category}
                        </span>
                        <button
                          className="icon-button"
                          aria-label={`Remove ${entry.idea.title}`}
                          onClick={() => toggleSave(s.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <h2>{entry.idea.title}</h2>
                      <p>{entry.idea.summary}</p>
                      <label htmlFor={`note-${s.id}`}>YOUR NOTE</label>
                      <textarea
                        id={`note-${s.id}`}
                        value={s.note}
                        placeholder="What did this make you think of?"
                        onChange={(e) =>
                          setSaved((v) =>
                            v.map((v) =>
                              v.id === s.id
                                ? { ...v, note: e.target.value }
                                : v,
                            ),
                          )
                        }
                      />
                      <button
                        className="text-button"
                        onClick={() => chooseTopic(entry.topic, entry.idea)}
                      >
                        Back to the thread <ArrowUpRight size={16} />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
      {searchOpen && (
        <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
          <section
            className="search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Find a rabbit hole"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
                  "button, input, a[href]",
                );
                const first = focusable[0],
                  last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <div className="modal-search">
              <Search size={21} />
              <input
                ref={searchRef}
                placeholder="What are you curious about?"
                aria-label="Search ideas"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="icon-button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="search-results">
              <div className="overline">
                {query
                  ? `${results.length} CONNECTED IDEAS`
                  : "THREE DOORS. COUNTLESS CONNECTIONS."}
              </div>
              {query ? (
                results.length ? (
                  results.map(({ idea, topic: t }) => (
                    <button
                      className="search-result"
                      key={idea.id}
                      onClick={() => chooseTopic(t, idea)}
                    >
                      <span className={`result-icon ${t.accent}`}>
                        {React.createElement(icons[idea.icon], { size: 20 })}
                      </span>
                      <span>
                        <strong>{idea.title}</strong>
                        <small>
                          {idea.category} · {t.short}
                        </small>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  ))
                ) : (
                  <div className="no-results">
                    <Compass size={28} />
                    <h3>That trail hasn’t been mapped yet.</h3>
                    <p>
                      This edition has 18 curated ideas. Try “forest”, “dream”,
                      “ocean”, or “consciousness”.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setQuery("")}
                    >
                      Explore the starting questions <ArrowRight size={15} />
                    </button>
                  </div>
                )
              ) : (
                topics.map((t) => (
                  <button
                    key={t.id}
                    className="search-result"
                    onClick={() => chooseTopic(t)}
                  >
                    <span className={`result-icon ${t.accent}`}>
                      {React.createElement(icons[t.nodes[0].icon], {
                        size: 22,
                      })}
                    </span>
                    <span>
                      <strong>{t.title}</strong>
                      <small>{t.tags.join(" · ")}</small>
                    </span>
                    <ArrowUpRight size={18} />
                  </button>
                ))
              )}
            </div>
            <div className="search-footer">
              <span>
                <BookOpen size={13} /> Human-curated. Source-linked. Open to
                questions.
              </span>
              <kbd>ESC to close</kbd>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function ForestArt() {
  return (
    <svg
      className="forest-art"
      viewBox="0 0 360 180"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="treeGlow"
          x1="180"
          y1="10"
          x2="180"
          y2="180"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d7e6a0" />
          <stop offset="1" stopColor="#718963" />
        </linearGradient>
      </defs>
      <g stroke="url(#treeGlow)" strokeWidth="1.2">
        <path d="M180 143V36M180 65l-25-18m25 33 29-24m-29 41-44-29m44 43 47-34m-47 48-57-25m57 33 58-25M155 47l-4-15m4 15-20-3m74 12 3-17m-3 17 21-4M136 68l-8-20m8 20-26-1m117 10 10-23m-10 23 25-4m-129 27-16-22m16 22-25-3m140 11 17-21m-17 21 27-6M180 143l-22 17-30 9m52-26 18 19 31 10m-49-29-4 31m4-31-42 9-24-3m66-6 42 4 22-11" />
        <path d="M180 37l-9-15m9 15 9-14m-9 120-14 14m-8 3-2 12m42-10 2 13m-62-23-8 8m92-13 15 8" />
      </g>
      <g fill="#c9dba0">
        <circle cx="180" cy="34" r="3" />
        <circle cx="155" cy="47" r="2" />
        <circle cx="209" cy="56" r="2.5" />
        <circle cx="136" cy="68" r="2.5" />
        <circle cx="227" cy="77" r="3" />
        <circle cx="123" cy="100" r="2" />
        <circle cx="238" cy="108" r="2.5" />
      </g>
      <ellipse
        cx="180"
        cy="142"
        rx="93"
        ry="10"
        stroke="#8ea176"
        strokeOpacity=".2"
      />
      <ellipse
        cx="180"
        cy="142"
        rx="119"
        ry="20"
        stroke="#8ea176"
        strokeOpacity=".12"
      />
    </svg>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
