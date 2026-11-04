import { useEffect, useRef } from "react";
import { ArrowRight, Bookmark, Check } from "lucide-react";
import { allIdeas } from "./data";
import { questionById, type Question } from "./questions";
import Experiment from "./Experiments";

export default function Discovery({
  question,
  from,
  connection,
  onContinue,
  saved,
  onSave,
}: {
  question: Question;
  from?: string;
  connection?: string;
  onContinue: () => void;
  saved: boolean;
  onSave: (id: string) => void;
}) {
  const idea = allIdeas.find((entry) => entry.idea.id === question.idea)!.idea;
  const previous = from ? questionById.get(from) : undefined;
  const crossed = previous && previous.world !== question.world;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [question.id]);
  return (
    <section className="discovery-card" aria-label="Your discovery">
      <div className="discovery-steps">
        <span>01 Choose</span>
        <strong>02 Discover & play</strong>
        <span>03 Follow a thread</span>
      </div>
      {crossed && (
        <div className="connection-reward" role="status">
          <span>YOU FOUND A CONNECTION</span>
          <h2>
            {previous.world} ↔ {question.world}
          </h2>
          <p>Two different worlds, one shared question.</p>
          <p>{connection}</p>
        </div>
      )}
      <span className="discovery-eyebrow">SOMETHING TO TAKE WITH YOU</span>
      <h1 ref={heading} tabIndex={-1}>
        {idea.title}
      </h1>
      <p className="discovery-lead">{idea.summary}</p>
      <p>{idea.body}</p>
      <Experiment
        world={question.world}
        initialDepth={question.idea === "vents" ? 2800 : 0}
      />
      <section
        className="discovery-evidence"
        aria-label="What the evidence says"
      >
        <h2>What the evidence says</h2>
        <p>{idea.uncertainty}</p>
        <a href={idea.source.url} target="_blank" rel="noreferrer">
          {idea.source.publisher} · {idea.source.title} ↗
        </a>
      </section>
      <div className="discovery-actions">
        <button aria-pressed={saved} onClick={() => onSave(idea.id)}>
          {saved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
          {saved ? "Discovery saved" : "Save discovery"}
        </button>
        <button onClick={onContinue}>
          Choose where to go next <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
