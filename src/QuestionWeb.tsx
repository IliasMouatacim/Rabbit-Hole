import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, GitBranch, Network } from "lucide-react";
import { questionById, type World } from "./questions";
import { discoveredNodes, type WebState } from "./web-state";
import WebOverview from "./WebOverview";
import "./simple-web.css";

export default function QuestionWeb(props: {
  world: World;
  state: WebState;
  onSelect: (id: string, revealPanel?: boolean) => void;
  onAnswer: (from: string, choice: number, revealPanel?: boolean) => void;
  hovered: number | null;
}) {
  const { world, state, onSelect, onAnswer, hovered } = props;
  const [overview, setOverview] = useState(false);
  const known = useMemo(
    () => [...discoveredNodes(world, state.edges)],
    [world, state.edges],
  );
  const current = questionById.get(state.selected)!;
  function revealCurrent() {
    requestAnimationFrame(() => {
      const map = document.getElementById("question-web");
      map?.scrollTo({ top: 0, behavior: "instant" });
      if (window.innerWidth <= 800)
        map?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  return (
    <section
      className={`simple-web ${overview ? "show-overview" : ""}`}
      aria-label="Your question connections"
    >
      <header className="simple-web-header">
        <div>
          <GitBranch size={18} />
          <span>
            Your web
            <small>
              {known.length} {known.length === 1 ? "question" : "questions"} ·{" "}
              {state.edges.length}{" "}
              {state.edges.length === 1 ? "connection" : "connections"}
            </small>
          </span>
        </div>
        <button
          onClick={() => setOverview((value) => !value)}
          aria-pressed={overview}
        >
          {overview ? <ArrowLeft size={15} /> : <Network size={15} />}
          {overview ? "Nearby questions" : "All connections"}
        </button>
      </header>
      {overview ? (
        <WebOverview {...props} />
      ) : (
        <div
          className="simple-web-body web-viewport"
          id="question-web"
          tabIndex={-1}
        >
          <div className="simple-web-copy">
            <h2>One question. Three directions.</h2>
            <p>Pick a branch to keep exploring. You can always come back.</p>
          </div>
          <div className="nearby-graph">
            <div className="nearby-current">
              <span>
                <i /> YOU ARE HERE
              </span>
              <h3>{current.title}</h3>
            </div>
            <div className="nearby-branches">
              {current.answers.map((answer, index) => {
                const followed = state.edges.includes(`${current.id}:${index}`);
                const next = questionById.get(answer.next)!;
                return (
                  <button
                    key={`${current.id}:${index}`}
                    className={`nearby-branch ${hovered === index ? "is-highlighted" : ""}`}
                    aria-label={`Explore question: ${next.title}`}
                    onClick={() => {
                      onAnswer(current.id, index, false);
                      revealCurrent();
                    }}
                  >
                    <span className="nearby-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <strong>{answer.text}</strong>
                    <span className="nearby-next">{next.title}</span>
                    <span className="nearby-action">
                      {followed ? (
                        <>
                          <Check size={14} /> Explored — revisit
                        </>
                      ) : (
                        <>
                          Follow this branch <ArrowRight size={14} />
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <nav className="nearby-history" aria-label="Revisit questions">
            <div>
              <span>YOUR EARLIER QUESTIONS</span>
              <small>Every branch stays saved</small>
            </div>
            {known.filter((id) => id !== current.id).length ? (
              <div className="nearby-history-list">
                {known
                  .filter((id) => id !== current.id)
                  .map((id) => (
                    <button
                      key={id}
                      aria-label={`Open question: ${questionById.get(id)!.title}`}
                      onClick={() => {
                        onSelect(id, false);
                        revealCurrent();
                      }}
                    >
                      <ArrowLeft size={13} />
                      {questionById.get(id)!.title}
                    </button>
                  ))}
              </div>
            ) : (
              <p>Your first branch starts above.</p>
            )}
          </nav>
        </div>
      )}
    </section>
  );
}
