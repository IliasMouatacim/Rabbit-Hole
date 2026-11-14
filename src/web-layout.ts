import { questionById, questions, type World } from "./questions";

export const WEB_SIZE = 3600;
export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 94;
export type Point = { x: number; y: number };

/** Stable radial positions: visiting a branch never reshuffles earlier nodes. */
export function layoutWeb(world: World): Map<string, Point> {
  const depth = new Map<string, number>([[world, 0]]);
  const queue: string[] = [world];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    for (const answer of questionById.get(id)!.answers) {
      if (depth.has(answer.next)) continue;
      depth.set(answer.next, depth.get(id)! + 1); queue.push(answer.next);
    }
  }
  // Other starting questions have no incoming answers. Reserve stable outer
  // positions for them without adding any fictional links to the web.
  const outerRing = Math.max(...depth.values()) + 1;
  questions.forEach(q => { if (!depth.has(q.id)) depth.set(q.id, outerRing); });
  const center = WEB_SIZE / 2;
  const positions = new Map<string, Point>([[world, { x: center, y: center }]]);
  for (let ring = 1; ring <= Math.max(...depth.values()); ring++) {
    const ids = questions.filter(q => depth.get(q.id) === ring).map(q => q.id);
    ids.forEach((id, index) => {
      const angle = -Math.PI / 2 + index / ids.length * Math.PI * 2 + (ring % 2 === 0 ? .22 : 0);
      positions.set(id, { x: center + Math.cos(angle) * ring * 270, y: center + Math.sin(angle) * ring * 270 });
    });
  }
  return positions;
}

export function webBounds(ids: string[], positions: Map<string, Point>) {
  const nodes = ids.map(id => positions.get(id)!).filter(Boolean);
  const left = Math.min(...nodes.map(p => p.x)) - NODE_WIDTH / 2 - 35;
  const top = Math.min(...nodes.map(p => p.y)) - NODE_HEIGHT / 2 - 35;
  const right = Math.max(...nodes.map(p => p.x)) + NODE_WIDTH / 2 + 35;
  const bottom = Math.max(...nodes.map(p => p.y)) + NODE_HEIGHT / 2 + 35;
  return { x: (left + right) / 2, y: (top + bottom) / 2, width: right - left, height: bottom - top };
}
