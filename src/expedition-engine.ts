export type Link = [number, number];
export type Mode = 'challenge' | 'practice';
export type Loadout = 'scout' | 'guardian';
export type Site = { id: number; x: number; y: number; kind: 'start' | 'fragment' | 'cache' | 'hazard' | 'bargain' | 'secret' | 'exit' | 'junction'; name: string };
export type Chart = { seed: string; nodes: Site[]; links: Link[]; secretLinks: Link[]; fragments: number[] };
export type Expedition = { node: number; energy: number; moves: number; fragments: number[]; visited: number[]; revealed: number[]; used: number[]; scan: number; shield: number; reroute: number; armed: boolean; extra: Link[]; broken: Link[]; threat: number; phase: 'explore' | 'escape'; escape: number; encounter: number | null; event: number | null; status: 'playing' | 'won' | 'lost' | 'extracted'; message: string; cause: string; discoveries: string[]; mode: Mode; loadout: Loadout; modifier: boolean; scanned: number; world?: string; path?: number[]; upgrades?: Upgrade[]; reward?: boolean; guardian?: number; freeReroutes?: number };

export function normalSeed(value: string) { return value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24) || 'ABYSS-001'; }
export function random(seed: string) { let value = 2166136261; for (const c of seed) value = Math.imul(value ^ c.charCodeAt(0), 16777619); return () => { value += 0x6D2B79F5; let t = Math.imul(value ^ value >>> 15, 1 | value); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function makeChart(input: string): Chart {
  const seed = normalSeed(input), rand = random(seed);
  const fragments = [7 + Math.floor(rand() * 3), 11 + Math.floor(rand() * 3), 15 + Math.floor(rand() * 3)];
  const names = ['The bell', 'Drift junction', 'Oxygen garden', 'Black current', 'A stranger’s offer', 'Air pocket', 'The crossing', 'Glass reef', 'Old observatory', 'Whale fall', 'Quiet harbour', 'Lost beacon', 'Vent cathedral', 'The blue dark', 'Uncharted signal', 'Echo chamber', 'Memory reef', 'The last light', 'The ascent'];
  const eventSite = rand() < .5 ? 1 : 6;
  const nodes: Site[] = Array.from({ length: 19 }, (_, i) => {
    const inner = i < 7, a = ((i - (inner ? 1 : 7)) * (inner ? 60 : 30) - 90) * Math.PI / 180;
    const radius = inner ? 128 : 262;
    return { id: i, x: i ? 350 + Math.cos(a) * radius : 350, y: i ? 320 + Math.sin(a) * radius : 320, kind: i === 0 ? 'start' : i === 18 ? 'exit' : fragments.includes(i) ? 'fragment' : [2, 5, 10].includes(i) ? 'cache' : i === 4 || i === eventSite ? 'bargain' : i === 14 ? 'secret' : [3, 9, 13].includes(i) ? 'hazard' : 'junction', name: names[i] };
  });
  const links: Link[] = [];
  // Each wedge is a handcrafted Y, fork, or bridge; the outer ring guarantees connectivity.
  for (let i = 0; i < 6; i++) {
    links.push([0, i + 1], [i + 1, (i + 1) % 6 + 1]);
    const type = Math.floor(rand() * 3), a = 7 + i * 2, b = 7 + (i * 2 + 1) % 12;
    links.push([i + 1, type === 1 ? b : a]);
    if (type === 2) links.push([i + 1, b]);
  }
  for (let i = 0; i < 12; i++) links.push([7 + i, 7 + (i + 1) % 12]);
  const secretLinks: Link[] = [[2, 14], [5, 8], [1, 17]];
  return { seed, nodes, links, secretLinks, fragments };
}
export function newExpedition(mode: Mode, loadout: Loadout, modifier = false, world?: string): Expedition {
  return { node: 0, energy: modifier ? 22 : 28, moves: 0, fragments: [], visited: [0], revealed: [], used: [], scan: loadout === 'scout' ? 3 : 2, shield: loadout === 'guardian' ? 2 : 1, reroute: 1, armed: false, extra: [], broken: [], threat: -1, phase: 'explore', escape: modifier ? 5 : 7, encounter: null, event: null, status: 'playing', message: 'Pip: “Three fragments. One way out. Probably. Pick a glowing route.”', cause: '', discoveries: [], mode, loadout, modifier, scanned: 0, ...(world ? { world, path: [0], upgrades: [] } : {}) };
}
const same = (a: Link, b: Link) => a[0] === b[0] && a[1] === b[1] || a[0] === b[1] && a[1] === b[0];
export const activeLinks = (chart: Chart, run: Expedition) => [...chart.links, ...run.extra].filter(link => !run.broken.some(b => same(link, b)) && (!link.includes(14) || run.revealed.includes(14)));
export const neighbours = (chart: Chart, run: Expedition, node = run.node) => activeLinks(chart, run).flatMap(([a,b]) => a === node ? [b] : b === node ? [a] : []);
export function mirageTarget(chart: Chart, run: Expedition) {
  if (run.world !== 'dreams' || run.threat < 0 || (run.moves + 1) % 3 !== 0) return -1;
  return neighbours(chart, run).filter(id => chart.nodes[id].kind === 'junction').sort((a,b) => a-b)[0] ?? -1;
}

export function moveCost(chart: Chart, run: Expedition, target: number) {
  if (target === mirageTarget(chart, run)) return 2;
  return chart.nodes[target].kind === 'hazard' && !run.armed ? 3 : 1;
}
export function nextThreat(chart: Chart, run: Expedition): number {
  if (run.threat < 0) return -1;
  const queue = [[run.threat]], seen = new Set([run.threat]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i], node = path[path.length - 1];
    if (node === run.node) return path[1] ?? node;
    for (const next of neighbours(chart, run, node)) if (!seen.has(next)) { seen.add(next); queue.push([...path, next]); }
  }
  return run.threat;
}
export function pressingLane(chart: Chart, run: Expedition) {
  if (run.world !== 'football' || run.threat < 0 || (run.moves + 1) % 2 !== 0 || run.armed) return -1;
  const options = neighbours(chart, run);
  if (options.length < 2) return -1;
  const approach = nextThreat(chart, run);
  return options.includes(approach) ? approach : options.includes(run.threat) ? run.threat : -1;
}

function lose(run: Expedition, cause: string): Expedition { return { ...run, status: 'lost', cause, message: 'Pip: “We learned something. Next time, we bring a better plan.”' }; }
export function travel(chart: Chart, run: Expedition, target: number): Expedition {
  if (run.status !== 'playing' || run.encounter !== null || run.event !== null || run.reward || run.guardian !== undefined || !neighbours(chart, run).includes(target)) return run;
  if (target === pressingLane(chart, run)) return run;
  const cost = moveCost(chart, run, target);
  if (cost > run.energy) return lose(run, `Entering ${chart.nodes[target].name} needed ${cost} energy. You had ${run.energy}.`);
  let next: Expedition = { ...run, node: target, energy: run.energy - cost, moves: run.moves + 1, visited: [...new Set([...run.visited, target])], armed: run.armed && chart.nodes[target].kind !== 'hazard', message: `Pip: “${chart.nodes[target].name}. Watch your energy.”` };
  if (run.path) next.path = [...run.path, target];
  const site = chart.nodes[target];
  if (run.armed && site.kind === 'hazard') next.message = 'Shield absorbed the hazard. Just 1 energy spent.';
  if (site.kind === 'cache' && !run.used.includes(target)) next = { ...next, energy: next.energy + 5, used: [...next.used, target], message: 'Air pocket found. +5 energy. Even adventurers need a breather.' };
  if (site.kind === 'secret' && !run.used.includes(target)) next = { ...next, energy: next.energy + 4, shield: next.shield + 1, used: [...next.used, target], message: 'Secret garden! +4 energy and a Shield charge. Escape with it for the Secret Keeper ending. Pip is suspiciously impressed.' };
  if (run.phase === 'escape') {
    next.escape--;
    if (next.moves % 2 === 0 && run.node !== 0) {
      const candidate: Link = [run.node, target];
      const test = { ...next, broken: [...next.broken, candidate] };
      const seen = new Set([target]), queue = [target];
      for (let i = 0; i < queue.length; i++) for (const n of neighbours(chart, test, queue[i])) if (!seen.has(n)) { seen.add(n); queue.push(n); }
      if (seen.has(18)) next.broken = test.broken;
    }
  }
  if (run.world === 'forest' && next.threat >= 0 && next.moves % 3 === 0) {
    const candidate: Link = [run.node, target];
    const overgrown = { ...next, broken: [...next.broken, candidate] };
    const reachable = new Set([target]);
    for (const node of reachable) for (const other of neighbours(chart, overgrown, node)) reachable.add(other);
    if ([18, ...chart.fragments.filter(id => !run.fragments.includes(id))].every(id => reachable.has(id))) {
      next.broken = overgrown.broken;
      next.message = 'Overgrowth closed the thread behind you.';
    }
  }
  if (target === mirageTarget(chart, run)) next.message = 'A false trail folded back. Finding the real path cost an extra energy.';
  if (run.world === 'ocean' && next.threat >= 0 && site.kind === 'hazard' && next.moves % 3 === 0 && !run.armed) {
    const drift = neighbours(chart, next).find(id => chart.nodes[id].kind === 'junction');
    if (drift !== undefined) {
      next = { ...next, node: drift, visited: [...new Set([...next.visited, drift])], path: [...(next.path ?? []), drift],
        message: `The black current swept you toward ${chart.nodes[drift].name}.` };
    }
  }
  if (next.threat >= 0 && next.moves % threatInterval(run) === 0) {
    next.threat = nextThreat(chart, run);
  }
  if (next.threat >= 0) {
    if (next.threat === next.node) {
      const hit = run.world === 'forest' ? 2 : run.world === 'football' ? 3 : 4;
      next.energy -= next.armed ? 0 : hit;
      next.message = next.armed ? 'Shield turned the creature away.' : `The threat caught you. −${hit} energy.`;
      next.armed = false;
    }
  }
  // Arrival at the exit wins before a same-turn collapse; the last energy can get you home.
  if (target === 18 && next.fragments.length === 3 && next.energy >= 0) return { ...next, status: 'won', message: 'The fragments are safe. So are you. Pip pretends not to be relieved.' };
  if (next.energy <= 0) return lose(next, `The move into ${site.name}${next.threat === next.node ? ' and a creature encounter' : ''} exhausted your energy.`);
  if (next.phase === 'escape' && next.escape <= 0) return lose(next, 'The escape window closed. Reaching the ascent earlier or saving Reroute would have helped.');
  if (run.world && target === 6 && !run.used.includes(target) && next.phase === 'explore') next.guardian = target;
  if (site.kind === 'fragment' && !next.fragments.includes(target)) next.encounter = target;
  if (next.guardian === undefined && site.kind === 'bargain' && !next.used.includes(target)) next.event = target;
  return next;
}
export function ability(chart: Chart, run: Expedition, type: 'scan' | 'shield' | 'reroute'): Expedition {
  if (run.status !== 'playing' || run.encounter !== null || run.event !== null || run.reward || run.guardian !== undefined || run[type] < 1) return run;
  if (type === 'shield') return run.armed ? run : { ...run, shield: run.shield - 1, armed: true, message: 'Shield armed. The next hazard or creature hit is protected.' };
  if (type === 'scan') {
    const revealed = chart.nodes.filter(n => n.id === 14 || neighbours(chart, run).includes(n.id)).map(n => n.id);
    const fresh = revealed.filter(n => !run.revealed.includes(n));
    const extra = [...run.extra, ...chart.secretLinks.filter(l => !run.extra.some(e => same(e,l)))];
    const gain = run.fragments.length ? fresh.length : 0;
    return { ...run, scan: run.scan - 1, revealed: [...new Set([...run.revealed, ...revealed])], extra, energy: run.energy + gain, scanned: run.scanned + fresh.length, message: `Scan revealed ${fresh.length} sites and hidden threads.${run.fragments.length ? ` Recovery lens: +${gain} energy.` : ' Recover a fragment to upgrade Scan with energy recovery.'}` };
  }
  const cost = run.freeReroutes ? 0 : 2;
  if (run.energy <= cost) return run;
  const targets = [18, ...chart.fragments, 2, 5].filter(n => n !== run.node && !neighbours(chart, run).includes(n) && !run.broken.some(link => same(link, [run.node, n])));
  const target = run.phase === 'escape' ? targets.find(n => n === 18) : targets.find(n => chart.fragments.includes(n) && !run.fragments.includes(n)) ?? targets[0];
  if (target === undefined) return run;
  return { ...run, energy: run.energy - cost, freeReroutes: Math.max(0, (run.freeReroutes ?? 0) - 1), reroute: run.reroute - 1, extra: [...run.extra, [run.node, target]], message: `Reroute opened a direct thread to ${chart.nodes[target].name}. Cost: ${cost} energy. Move along it when ready.` };
}
export function resolveEncounter(run: Expedition, chart: Chart, title: string): Expedition {
  if (run.encounter === null || run.status !== 'playing') return run;
  const fragments = [...run.fragments, run.encounter];
  return { ...run, fragments, encounter: null, reward: !!run.world, energy: run.energy + 4, scan: run.scan + (fragments.length === 1 ? 1 : 0), threat: run.threat < 0 ? 10 : run.threat, discoveries: [...run.discoveries, title], phase: fragments.length === 3 ? 'escape' : 'explore', message: fragments.length === 3 ? 'THE ASCENT IS OPEN. The web is collapsing. Reach the exit before the escape counter runs out.' : fragments.length === 1 ? 'Fragment recovered! +4 energy. Scan now restores energy for newly revealed sites. Something just woke up…' : 'Fragment recovered. +4 energy. Pip: “One more. And maybe stop waving at the creature.”' };
}
export function bargain(run: Expedition, choice: 'shield' | 'energy' | 'leave'): Expedition {
  if (run.event === null || run.status !== 'playing') return run;
  if (choice === 'shield' && run.energy <= 2) return run;
  const relay = run.event !== 4;
  return { ...run, event: null, used: [...run.used, run.event], energy: run.energy + (choice === 'shield' ? -2 : choice === 'energy' ? 3 : 0), shield: run.shield + (choice === 'shield' && !relay ? 1 : 0), reroute: run.reroute + (choice === 'shield' && relay ? 1 : 0), threat: choice === 'energy' ? 6 : run.threat, message: choice === 'shield' ? relay ? 'Survey relay repaired. −2 energy, +1 Reroute.' : 'Bargain made. −2 energy, +1 Shield.' : choice === 'energy' ? '+3 energy. The noise attracted the creature to the inner web.' : 'You left the offer alone. Pip approves of this deeply uncharacteristic restraint.' };
}
export const expeditionScore = (run: Expedition) => Math.max(0, run.fragments.length * 300 + run.energy * 10 - run.moves * 5 + (run.status === 'won' ? 500 : 0));
export function challengeURL(world: string, seed: string, modifier: boolean) { return `#play/${world}?seed=${normalSeed(seed)}${modifier ? '&hard=1' : ''}`; }
export function dailySeed(date = new Date()) { return `DAILY-${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(date)}`; }

export type Upgrade = 'Scan charge' | 'Free Reroute' | 'Shield charge';
export const upgrades: Upgrade[] = ['Scan charge', 'Free Reroute', 'Shield charge'];

export function chooseUpgrade(run: Expedition, upgrade: Upgrade): Expedition {
  if (!run.reward || run.status !== 'playing') return run;
  return {
    ...run, reward: false, upgrades: [...(run.upgrades ?? []), upgrade],
    scan: run.scan + Number(upgrade === 'Scan charge'),
    shield: run.shield + Number(upgrade === 'Shield charge'),
    reroute: run.reroute + Number(upgrade === 'Free Reroute'),
    freeReroutes: (run.freeReroutes ?? 0) + Number(upgrade === 'Free Reroute'),
  };
}

export function threatInterval(run: Expedition) {
  return run.world === 'music' ? run.fragments.length + 2 : run.world === 'football' ? 2 : 3;
}

export function guardianWager(run: Expedition, result: boolean | null): Expedition {
  if (run.guardian === undefined || run.status !== 'playing' || (result !== null && run.energy <= 2)) return run;
  return {
    ...run, used: [...run.used, run.guardian], guardian: undefined,
    energy: run.energy + (result === null ? 0 : result ? 2 : -2),
    message: result === null ? 'You passed the guardian.' : result ? 'Correct. Your wager earned 2 energy.' : 'The guardian kept your 2 energy wager.',
  };
}
