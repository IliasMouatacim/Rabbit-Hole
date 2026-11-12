export type Run = { node: number; energy: number; signals: number[]; charged: number[]; trail: number[] };
export const sectors = [
  { id: 'ocean', name: 'The midnight garden', world: 'Ocean', color: '#80edf0', subtitle: 'Carry a little light into the deep.', energy: 15, hazards: [2, 8], charges: [3, 10], signals: [7, 9, 11] },
  { id: 'forest', name: 'The sleeping forest', world: 'Nature', color: '#c9f78b', subtitle: 'Everything is connected. Find your way through.', energy: 14, hazards: [2, 4, 8], charges: [3, 10], signals: [8, 10, 11] },
  { id: 'dreams', name: 'A beautiful distraction', world: 'Mind', color: '#c9b0ff', subtitle: 'The shortest path is not always the best one.', energy: 13, hazards: [1, 4, 9], charges: [5, 8], signals: [7, 9, 11] },
  { id: 'football', name: 'Space to create', world: 'Football', color: '#ffd39a', subtitle: 'Read the space. Make the next move count.', energy: 12, hazards: [2, 5, 10], charges: [4, 8], signals: [7, 9, 11] },
  { id: 'music', name: 'One last resonance', world: 'Music', color: '#ffa8c5', subtitle: 'Find the rhythm hiding between the lines.', energy: 12, hazards: [1, 3, 10], charges: [2, 8], signals: [7, 9, 11] },
];
export const links: [number, number][] = [
  ...Array.from({ length: 6 }, (_, i): [number, number] => [0, i + 1]),
  ...Array.from({ length: 6 }, (_, i): [number, number] => [i + 1, (i + 1) % 6 + 1]),
  ...Array.from({ length: 6 }, (_, i): [number, number] => [i + 1, i + 7]),
  ...Array.from({ length: 6 }, (_, i): [number, number] => [i + 7, (i + 1) % 6 + 7]),
];
export const positions = Array.from({ length: 13 }, (_, i) => {
  if (!i) return { x: 350, y: 320 };
  const a = ((i - 1) % 6 * 60 - 90) * Math.PI / 180;
  const r = i < 7 ? 130 : 255;
  return { x: 350 + Math.cos(a) * r, y: 320 + Math.sin(a) * r };
});
const blocked = [[], ['9-10', '7-12'], ['8-9', '10-11', '0-4'], ['7-8', '9-10', '0-3', '0-5'], ['8-9', '10-11', '7-12', '0-2', '0-4', '0-6']];
export const levelLinks = (level: number) => links.filter(([a,b]) => !blocked[level].includes(`${Math.min(a,b)}-${Math.max(a,b)}`));
export const startRun = (level: number): Run => ({ node: 0, energy: sectors[level].energy, signals: [], charged: [], trail: [0] });
export function move(run: Run, target: number, level: number): Run | null {
  if (!levelLinks(level).some(([a, b]) => (a === run.node && b === target) || (b === run.node && a === target))) return null;
  const sector = sectors[level];
  const cost = sector.hazards.includes(target) ? 3 : 1;
  if (run.energy < cost || won(run)) return null;
  const charge = sector.charges.includes(target) && !run.charged.includes(target);
  return { node: target, energy: run.energy - cost + (charge ? 3 : 0), signals: sector.signals.includes(target) && !run.signals.includes(target) ? [...run.signals, target] : run.signals, charged: charge ? [...run.charged, target] : run.charged, trail: [...run.trail, target] };
}
export const won = (run: Run) => run.signals.length === 3 && run.node === 12;
export const canMove = (run: Run, level: number) => positions.some((_, i) => move(run, i, level));
export const rating = (run: Run) => run.trail.length <= 10 ? 3 : run.trail.length <= 14 ? 2 : 1;
