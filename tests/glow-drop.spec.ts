import { expect, test, type Page } from '@playwright/test';
import { dailySeed } from '../src/expedition-engine';
import {
  createBoard,
  MAX_ANGLE,
  newRun,
  nextBoard,
  retryBoard,
  settleDrop,
  traceDrop,
  worlds,
  type Board,
  type Run,
} from '../src/arcade/glow-engine';

function angles(board: Board, lit = 0) {
  return Array.from({ length: MAX_ANGLE * 2 + 1 }, (_, index) => {
    const angle = index - MAX_ANGLE;
    return { angle, shot: traceDrop(board, angle, lit) };
  });
}

async function aim(page: Page, angle: number) {
  const slider = page.getByRole('slider', { name: /Aim/ });
  let current = Number(await slider.inputValue());
  if (angle + MAX_ANGLE < Math.abs(current - angle)) {
    await slider.press('Home');
    current = -MAX_ANGLE;
  }
  if (MAX_ANGLE - angle < Math.abs(current - angle)) {
    await slider.press('End');
    current = MAX_ANGLE;
  }
  await slider.focus();
  while (current !== angle) {
    const step = Math.sign(angle - current);
    await page.keyboard.press(step === 1 ? 'ArrowRight' : 'ArrowLeft');
    current += step;
  }
  await expect(slider).toHaveValue(String(angle));
}

async function launch(page: Page, angle: number) {
  await aim(page, angle);
  await page.getByRole('button', { name: 'Drop spark', exact: true }).click();
  await page.getByRole('button', { name: 'Finish drop' }).click();
}

test('seeded charts have three reachable beacons and distinct world mechanics', () => {
  const effects = new Map<number, Set<string>>();
  for (let sample = 0; sample < 18; sample++) {
    for (let depth = 0; depth < worlds.length; depth++) {
      const seed = `CHART-${sample}`;
      const board = createBoard(seed, depth);
      expect(board).toEqual(createBoard(seed, depth));
      expect(board.beacons).toHaveLength(3);
      if (!depth) expect(traceDrop(board, board.initialAngle).chain).toBeGreaterThan(0);
      const shots = angles(board);
      expect(shots.reduce((mask, { shot }) => mask | shot.lit, 0)).toBe(7);
      const events = effects.get(depth) ?? new Set<string>();
      for (const { shot } of shots) for (const event of shot.events) events.add(event.kind);
      effects.set(depth, events);
    }
  }
  expect(effects.get(1)?.has('spring')).toBe(true);
  expect(effects.get(2)?.has('portal')).toBe(true);
  expect(effects.get(4)?.has('chime')).toBe(true);
  for (const effect of effects.values()) expect(effect.has('catch')).toBe(true);
});

test('catch, combo, reserve bonus and risk apply once and retries restore the board entry score', () => {
  const base = newRun('DIVE-SCORE');
  const board = createBoard(base.seed, 0);
  const shots = angles(board);
  const catchShot = shots.find(({ shot }) => shot.caught)!.shot;
  expect(settleDrop(base, catchShot).sparks).toBe(5);
  const { angle, shot } = shots.find(({ shot }) => shot.chain >= 2)!;
  expect(traceDrop(board, angle)).toEqual(shot);
  const doubled = traceDrop(board, angle, 0, 2);
  expect(doubled.points).toBe(shot.points * 2);
  expect(traceDrop(board, angle, shot.lit).points).toBe(0);
  const cleared = settleDrop(
    { ...base, lit: 7 ^ shot.lit, sparks: 1 },
    traceDrop(board, angle, 7 ^ shot.lit),
  );
  expect(cleared.phase).toBe('cleared');
  expect(cleared.score).toBe(shot.points + 30 * Number(shot.caught));
  expect(settleDrop(cleared, shot)).toEqual(cleared);
  const next = nextBoard(cleared, true);
  expect(next).toMatchObject({ depth: 1, multiplier: 2, sparks: 3, entryScore: cleared.score });
  expect(nextBoard(cleared, false)).toMatchObject({ sparks: 5, multiplier: 1 });
  expect(retryBoard({ ...next, score: next.score + 100, phase: 'lost', sparks: 0 })).toMatchObject({
    score: cleared.score,
    phase: 'aim',
    sparks: 3,
    retries: 1,
    lit: 0,
  });
});

test('the opening shot teaches combos, pauses and unlocks a discovery without setup', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Glow Drop' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Drop spark' })).toBeInViewport();
  const seed = await page.evaluate(
    () => `DAILY-${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date())}`,
  );
  const board = createBoard(seed, 0);
  const shot = traceDrop(board, board.initialAngle);
  await page.getByRole('button', { name: 'Enable sound' }).click();
  await expect(page.getByRole('button', { name: 'Mute sound' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('slider').focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Drop paused' })).toBeVisible();
  await page.getByRole('button', { name: 'How to play' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Resume drop' }).click();
  await expect(page.getByTestId('glow-score')).toHaveText(
    settleDrop(newRun(seed), shot).score.toLocaleString(),
    { timeout: 12000 },
  );
  await expect(page.getByRole('status')).toContainText(shot.chain === 1 ? 'Beacon lit' : 'combo');
  await page.locator('.glow-find summary').click();
  await expect(page.getByRole('link', { name: 'Read source' })).toHaveAttribute('href', /^https:/);
  await page.getByRole('button', { name: 'Read Ocean field notes' }).click();
  await expect(page.locator('.codex-shelf button')).toHaveCount(shot.chain);
  await page.getByRole('button', { name: /return to Glow Drop/ }).click();
  await expect(page.getByRole('heading', { name: 'Pearl Trench' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('play all five worlds, share an independent challenge and replay with the chart best', async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(90000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const seed = 'DIVE-FIVE';
  await page.goto(`/#glow?mode=free&seed=${seed}`);
  let run = newRun(seed);
  for (let depth = 0; depth < worlds.length; depth++) {
    const board = createBoard(seed, depth);
    await expect(page.getByRole('heading', { name: worlds[depth].board, exact: true })).toBeVisible();
    while (run.phase === 'aim') {
      const best = angles(board, run.lit).sort(
        (a, b) => b.shot.chain - a.shot.chain || b.shot.points - a.shot.points,
      )[0];
      expect(best.shot.chain).toBeGreaterThan(0);
      await launch(page, best.angle);
      run = settleDrop(run, traceDrop(board, best.angle, run.lit, run.multiplier));
      await expect(page.getByTestId('glow-score')).toHaveText(run.score.toLocaleString());
    }
    if (depth < worlds.length - 1) {
      const risk = depth % 2 === 0;
      await page.getByRole('button', { name: risk ? /Double down/ : /Steady dive/ }).click();
      run = nextBoard(run, risk);
      await expect(page.getByLabel(`${run.sparks} sparks left`)).toBeVisible();
    }
  }
  await expect(page.getByRole('heading', { name: 'Pip made it home!' })).toBeVisible();
  const discoveries = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('rh-descent-profile-v1') || '{}'),
  );
  expect(discoveries.discoveries).toHaveLength(15);
  expect(discoveries.dailyWins).toEqual([]);
  await page.getByRole('button', { name: 'Share result' }).click();
  const message = await page.evaluate(() => navigator.clipboard.readText());
  expect(message).toContain(`${run.score.toLocaleString()} points`);
  const friend = await browser.newPage();
  await friend.goto(message.split('\n').at(-1)!);
  await expect(friend.getByRole('heading', { name: 'Pearl Trench' })).toBeVisible();
  await expect(friend.getByTestId('glow-score')).toHaveText('0');
  await friend.close();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Pip made it home!' })).toBeVisible();
  await page.getByRole('button', { name: 'Play this chart again' }).click();
  await expect(page.getByTestId('glow-score')).toHaveText('0');
  await expect(page.getByText('Chart best')).toContainText(run.score.toLocaleString());
});

test('reload a flying spark, spend the last spark and retry the same board', async ({ page }) => {
  const seed = 'DIVE-RETRY';
  const board = createBoard(seed, 0);
  await page.goto(`/#glow?mode=free&seed=${seed}`);
  const shot = traceDrop(board, board.initialAngle);
  await page.getByRole('button', { name: 'Drop spark' }).click();
  await expect(page.getByRole('button', { name: 'Finish drop' })).toBeVisible();
  await page.reload();
  const settled = settleDrop(newRun(seed), shot);
  await expect(page.getByTestId('glow-score')).toHaveText(settled.score.toLocaleString());
  await expect(page.getByLabel(`${settled.sparks} sparks left`)).toBeVisible();
  const miss = angles(board, settled.lit).find(({ shot }) => !shot.caught && !shot.chain)!;
  for (let i = 0; i < settled.sparks; i++) {
    if (settled.sparks - i === 2) {
      await page.getByRole('button', { name: 'Pip’s aim hint' }).click();
      const suggested = Number(await page.getByRole('slider').inputValue());
      expect(traceDrop(board, suggested, settled.lit).chain).toBeGreaterThan(0);
    }
    await launch(page, miss.angle);
  }
  await expect(page.getByRole('heading', { name: 'One more drop?' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry this world' }).click();
  await expect(page.getByLabel('5 sparks left')).toBeVisible();
  await expect(page.getByTestId('glow-score')).toHaveText('0');
  const retry: Run = await page.evaluate(
    (seed) => JSON.parse(localStorage.getItem(`rh-glow-v1-free-${seed}`)!).run,
    seed,
  );
  expect(retry).toMatchObject({ retries: 1, depth: 0, seed, lit: 0 });
});

test('mobile touch, separate modes, storage recovery and the expeditions entrance', async ({
  browser,
}) => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  await page.addInitScript(() => localStorage.setItem('rh-glow-v1-free-DIVE-MOBILE', '{broken'));
  await page.goto('http://127.0.0.1:5173/#glow?mode=free&seed=DIVE-MOBILE');
  const field = page.getByRole('button', { name: /Aim and drop/ });
  await expect(field).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('button', { name: 'Drop spark' })).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const rect = (await field.boundingBox())!;
  await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height * 0.6);
  await page.getByRole('button', { name: 'Finish drop' }).click();
  const drop = await page.evaluate(
    () => JSON.parse(localStorage.getItem('rh-glow-v1-free-DIVE-MOBILE')!).run,
  );
  expect(drop.drops).toBe(1);
  await page.getByRole('button', { name: 'Daily challenge' }).click();
  await expect(page.getByTestId('glow-score')).toHaveText('0');
  await page.getByRole('button', { name: 'Free play' }).click();
  await expect(page).toHaveURL(/DIVE-MOBILE$/);
  await expect(page.getByTestId('glow-score')).toHaveText(drop.score.toLocaleString());
  await page.getByRole('link', { name: 'Expeditions' }).click();
  await expect(page.getByRole('button', { name: 'Start Daily Descent', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Pearl Trench' })).toBeVisible();
  await page.goto('http://127.0.0.1:5173/#glow?mode=daily&seed=DAILY-2026-02-30');
  await expect(page.getByRole('heading', { name: 'Glow Drop' })).toBeVisible();
  await page.getByRole('button', { name: 'Drop spark' }).click();
  expect(
    await page.evaluate((seed) => !!localStorage.getItem(`rh-glow-v1-daily-${seed}`), dailySeed()),
  ).toBe(true);
  await page.close();
});

test('a visit with storage disabled keeps its arcade run and unlocked notes across screens', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage is blocked', 'SecurityError');
    };
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage is blocked', 'SecurityError');
    };
  });
  await page.goto('/#glow?mode=free&seed=DIVE-OFFLINE');
  const board = createBoard('DIVE-OFFLINE', 0);
  const first = traceDrop(board, board.initialAngle);
  await launch(page, board.initialAngle);
  await expect(
    page.getByText('Storage is unavailable. This game will last for this visit.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Daily challenge' }).click();
  await page.getByRole('button', { name: 'Free play' }).click();
  await expect(page.getByTestId('glow-score')).toHaveText(
    settleDrop(newRun('DIVE-OFFLINE'), first).score.toLocaleString(),
  );
  await page.locator('.glow-find summary').click();
  await page.getByRole('button', { name: 'Read Ocean field notes' }).click();
  await expect(page.locator('.codex-shelf button')).toHaveCount(first.chain);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Pearl Trench' })).toBeVisible();
  await expect(page).toHaveURL(/DIVE-OFFLINE$/);
});
