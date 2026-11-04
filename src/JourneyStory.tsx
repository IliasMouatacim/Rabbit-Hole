import { useState } from "react";
import { questionById, type World } from "./questions";
import { webHash, type WebState } from "./web-state";
import { journeyStory } from "./journey-story";

export default function JourneyStory({
  world,
  state,
}: {
  world: World;
  state: WebState;
}) {
  const [status, setStatus] = useState("");
  const story = journeyStory(world, state);
  const nodes = [
    ...new Set([world, ...story.edges.flatMap((edge) => [edge.from, edge.to])]),
  ].slice(0, 8);
  const point = (id: string) => {
    const i = nodes.indexOf(id),
      angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 150 + Math.cos(angle) * 85, y: 110 + Math.sin(angle) * 80 };
  };
  const link = new URL(webHash(world, state), window.location.href).href;
  return (
    <details className="journey-story">
      <summary>
        Your journey so far · {story.discoveries.length} discoveries to share
      </summary>
      <p>
        I started with <strong>{story.start}</strong>
      </p>
      <p>
        Now I’m asking <strong>{story.end}</strong>
      </p>
      <svg
        viewBox="0 0 300 220"
        role="img"
        aria-label={`A miniature of the first ${nodes.length} questions in your actual web`}
      >
        {story.edges
          .filter(
            (edge) => nodes.includes(edge.from) && nodes.includes(edge.to),
          )
          .map((edge) => (
            <line
              key={edge.id}
              x1={point(edge.from).x}
              y1={point(edge.from).y}
              x2={point(edge.to).x}
              y2={point(edge.to).y}
              stroke="var(--discovery-accent,#b6d48b)"
            />
          ))}
        {nodes.map((id, i) => (
          <g key={id}>
            <title>{questionById.get(id)!.title}</title>
            <circle
              cx={point(id).x}
              cy={point(id).y}
              r="14"
              fill={id === state.selected ? "#d9eeb6" : "#61784b"}
            />
            <text
              x={point(id).x}
              y={point(id).y + 4}
              textAnchor="middle"
              fill="#12210e"
              fontSize="11"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <ol className="story-path">
        {nodes.map((id) => (
          <li key={id}>{questionById.get(id)!.title}</li>
        ))}
      </ol>
      <ul>
        {story.discoveries.map((idea) => (
          <li key={idea.id}>
            <strong>{idea.title}</strong>
            <p>{idea.summary}</p>
          </li>
        ))}
      </ul>
      {story.connection && (
        <p>
          <strong>An unexpected connection</strong>
          <br />
          {story.connection}
        </p>
      )}
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(
              `${story.text}\n\nFollow or diverge from my web: ${link}`,
            );
            setStatus("Journey copied with your discoveries and link.");
          } catch {
            setStatus("Copy the text and link below to share your journey.");
          }
        }}
      >
        Copy my journey
      </button>
      <p role="status">{status}</p>
      {status.startsWith("Copy the") && (
        <textarea
          aria-label="Journey text to copy"
          readOnly
          value={`${story.text}\n\n${link}`}
        />
      )}
    </details>
  );
}
