import { test, expect } from "@playwright/test";
import {
  layoutWeb,
  webBounds,
  WEB_SIZE,
  NODE_WIDTH,
  NODE_HEIGHT,
} from "../src/web-layout";
import { questions, worlds } from "../src/questions";

test("radial web layout is stable, complete, and separates all question cards", () => {
  for (const world of worlds) {
    const positions = layoutWeb(world);
    expect(positions).toEqual(layoutWeb(world));
    expect(positions.size).toBe(questions.length);
    expect(positions.get(world)).toEqual({ x: WEB_SIZE / 2, y: WEB_SIZE / 2 });
    const values = [...positions.values()];
    for (let i = 0; i < values.length; i++)
      for (let j = i + 1; j < values.length; j++) {
        const dx = Math.abs(values[i].x - values[j].x),
          dy = Math.abs(values[i].y - values[j].y);
        expect(
          dx >= NODE_WIDTH + 12 || dy >= NODE_HEIGHT + 12,
          `Overlapping nodes in ${world}`,
        ).toBe(true);
      }
    const bounds = webBounds([...positions.keys()], positions);
    expect(Number.isFinite(bounds.width)).toBe(true);
    expect(bounds.width).toBeGreaterThan(0);
  }
});
