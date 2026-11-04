import { allIdeas } from "./data";
import { questionById, type World } from "./questions";
import { edgeById, type WebState } from "./web-state";

export function journeyStory(world: World, state: WebState) {
  const edges = state.edges.map((id) => edgeById.get(id)!).filter(Boolean);
  const ids = [
    ...new Set(edges.map((edge) => questionById.get(edge.to)!.idea)),
  ].slice(0, 3);
  const discoveries = ids.map(
    (id) => allIdeas.find((entry) => entry.idea.id === id)!.idea,
  );
  const cross = edges.find(
    (edge) =>
      questionById.get(edge.from)!.world !== questionById.get(edge.to)!.world,
  );
  const connection = cross
    ? questionById.get(cross.from)!.answers[cross.choice].connection
    : null;
  const start = questionById.get(world)!.title;
  const end = questionById.get(state.selected)!.title;
  const text = [
    `I started with “${start}”`,
    `Now I’m asking “${end}”`,
    ...discoveries.map((idea) => `• ${idea.title}: ${idea.summary}`),
    ...(connection ? [`An unexpected connection: ${connection}`] : []),
  ].join("\n\n");
  return { discoveries, connection, start, end, text, edges };
}
