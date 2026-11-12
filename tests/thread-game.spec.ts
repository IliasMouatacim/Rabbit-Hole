import { test, expect } from '@playwright/test';
import { canMove, move, positions, sectors, startRun, won, type Run } from '../src/thread-engine';

function solve(level: number): Run {
  const queue = [startRun(level)], seen = new Set<string>();
  for (let index = 0; index < queue.length; index++) {
    const run = queue[index];
    if (won(run)) return run;
    for (let target = 0; target < positions.length; target++) {
      const next = move(run, target, level);
      if (!next) continue;
      const key = `${next.node}/${next.energy}/${[...next.signals].sort()}/${[...next.charged].sort()}`;
      if (!seen.has(key)) { seen.add(key); queue.push(next); }
    }
  }
  throw new Error(`Sector ${level} has no solution`);
}

test('every sector has an affordable route to all three signals and the exit', () => {
  sectors.forEach((_, level) => { const solution = solve(level); expect(solution.energy).toBeGreaterThanOrEqual(0); expect(solution.signals).toHaveLength(3); expect(solution.node).toBe(12); expect(canMove(solution, level)).toBe(false); });
});

test('non-neighbours are rejected and recharges work only once', () => {
  let run = startRun(0);
  expect(move(run, 7, 0)).toBeNull();
  run = move(run, 3, 0)!;
  expect(run.energy).toBe(17);
  run = move(run, 0, 0)!;
  run = move(run, 3, 0)!;
  expect(run.energy).toBe(15);
  expect(run.charged).toEqual([3]);
  expect(move({ ...run, energy: 2 }, 2, 0)).toBeNull();
});

test('a complete game awards stars, advances worlds, and preserves rewards after reload', async ({ page }) => {
  await page.goto('/#play/ocean');
  await expect(page.getByRole('heading', { name: 'Follow the thread.' })).toBeVisible();
  const solution = solve(0);
  for (const node of solution.trail.slice(1)) await page.getByRole('button', { name: new RegExp(`, node ${node}$`) }).click();
  await expect(page.getByRole('heading', { name: 'You found a way.' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('rh-thread-stars') || '[]')[0])).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Next world', exact: true }).click();
  await expect(page).toHaveURL(/#play\/forest$/);
  await page.reload();
  await expect(page.getByRole('button', { name: /Ocean/ })).toContainText('★');
});

test('mobile keyboard movement, undo, help, and exploration remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#play/ocean');
  await page.getByRole('button', { name: 'Junction, node 1', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Your spark, node 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Your spark, node 0' })).toBeVisible();
  await page.getByRole('button', { name: 'How to play' }).click();
  await expect(page.locator('.thread-help')).toContainText('There’s no timer');
  await page.getByRole('button', { name: 'Got it' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Free exploration', exact: true }).click();
  await expect(page).toHaveURL(/#journey\/ocean/);
  await page.getByRole('button', { name: 'Play Thread' }).click();
  await expect(page).toHaveURL(/#play\/ocean/);
});
