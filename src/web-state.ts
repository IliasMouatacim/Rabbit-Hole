import { questions, walkTrail, type World } from "./questions";

/** Edges, not a single path, are the durable record of an exploration. */
export type WebState = {
  version: 2;
  edges: string[];
  selected: string;
  history: string[];
};
export type WebEdge = { id: string; from: string; to: string; choice: number };
export const webEdges: WebEdge[] = questions.flatMap((q) =>
  q.answers.map((answer, choice) => ({
    id: `${q.id}:${choice}`,
    from: q.id,
    to: answer.next,
    choice,
  })),
);
export const edgeById = new Map(webEdges.map((edge) => [edge.id, edge]));
export const webStorageKey = (world: World) => `rh-web-v2-${world}`;
export const emptyWeb = (world: World): WebState => ({
  version: 2,
  edges: [],
  selected: world,
  history: [],
});

export function discoveredNodes(world: World, edges: string[]) {
  const nodes = new Set<string>([world]);
  for (const id of edges) {
    const edge = edgeById.get(id);
    if (edge) {
      nodes.add(edge.from);
      nodes.add(edge.to);
    }
  }
  return nodes;
}

export function validateWeb(world: World, input: unknown): WebState {
  if (!input || typeof input !== "object") return emptyWeb(world);
  const candidate = input as Partial<WebState>;
  if (!Array.isArray(candidate.edges)) return emptyWeb(world);
  const pending = new Set(
    candidate.edges.filter(
      (id): id is string => typeof id === "string" && edgeById.has(id),
    ),
  );
  const reachable = new Set<string>([world]);
  const edges: string[] = [];
  // A share URL may list edges in any order. Only keep the connected component
  // reachable from this world's root; never invent an edge to recover data.
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of pending) {
      const edge = edgeById.get(id)!;
      if (!reachable.has(edge.from)) continue;
      pending.delete(id);
      edges.push(id);
      reachable.add(edge.to);
      changed = true;
    }
  }
  const selected =
    typeof candidate.selected === "string" && reachable.has(candidate.selected)
      ? candidate.selected
      : world;
  const history = Array.isArray(candidate.history)
    ? candidate.history
        .filter(
          (id): id is string => typeof id === "string" && reachable.has(id),
        )
        .slice(-200)
    : [];
  return { version: 2, edges, selected, history };
}

export function webFromTrail(world: World, input: unknown): WebState {
  const trail = walkTrail(world, input);
  return validateWeb(world, {
    edges: trail.steps.map((step) => `${step.question.id}:${step.choice}`),
    selected: trail.current.id,
    history: trail.steps.map((step) => step.question.id),
  });
}

export function followAnswer(state: WebState, choice: number): WebState {
  const edge = edgeById.get(`${state.selected}:${choice}`);
  if (!edge) return state;
  return {
    version: 2,
    edges: state.edges.includes(edge.id)
      ? state.edges
      : [...state.edges, edge.id],
    selected: edge.to,
    history: [...state.history, state.selected].slice(-200),
  };
}

export function selectDiscovered(
  world: World,
  state: WebState,
  id: string,
): WebState {
  if (id === state.selected || !discoveredNodes(world, state.edges).has(id))
    return state;
  return {
    ...state,
    selected: id,
    history: [...state.history, state.selected].slice(-200),
  };
}

export function goBack(state: WebState): WebState {
  if (!state.history.length) return state;
  return {
    ...state,
    selected: state.history.at(-1)!,
    history: state.history.slice(0, -1),
  };
}

export function webHash(world: World, state: WebState) {
  const encoded = state.edges
    .map((id) => webEdges.findIndex((edge) => edge.id === id).toString(36))
    .join(".");
  return `#journey/${world}?w=${encoded}&at=${state.selected}`;
}

export function webFromHash(world: World, hash: string): WebState | null {
  const [route, query] = hash.split("?");
  if (route !== `#journey/${world}`) return null;
  const params = new URLSearchParams(query);
  if (params.has("w")) {
    const edges = (params.get("w") || "")
      .split(".")
      .filter((token) => /^[0-9a-z]{1,2}$/.test(token))
      .map((token) => webEdges[parseInt(token, 36)]?.id)
      .filter(Boolean);
    return validateWeb(world, { edges, selected: params.get("at") });
  }
  if (params.has("p"))
    return webFromTrail(
      world,
      [...(params.get("p")?.match(/^[012]*/)?.[0] || "")].map(Number),
    );
  return null;
}

export function loadWeb(
  world: World,
  hash: string,
  storage: Pick<Storage, "getItem">,
): WebState {
  const shared = webFromHash(world, hash);
  try {
    const current = storage.getItem(webStorageKey(world));
    if (shared) {
      // Reloading our own URL should preserve navigation history. A different
      // shared web still takes precedence over this device's saved exploration.
      if (current !== null) {
        const saved = validateWeb(world, JSON.parse(current));
        if (
          saved.selected === shared.selected &&
          saved.edges.length === shared.edges.length &&
          saved.edges.every((id) => shared.edges.includes(id))
        ) {
          return { ...shared, history: saved.history };
        }
      }
      return shared;
    }
    if (current !== null) return validateWeb(world, JSON.parse(current));
    return webFromTrail(
      world,
      JSON.parse(storage.getItem(`rh-journey-v1-${world}`) || "[]"),
    );
  } catch {
    return shared ?? emptyWeb(world);
  }
}

export function visibleWeb(world: World, state: WebState) {
  const discovered = discoveredNodes(world, state.edges);
  const visible = new Set(discovered);
  // Keep unanswered branches of earlier questions visible, too. A question is
  // one shared node even when several different answers lead back to it.
  const edges = webEdges.filter((edge) => discovered.has(edge.from));
  edges.forEach((edge) => visible.add(edge.to));
  return { nodes: [...visible], discovered, edges };
}
