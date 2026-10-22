import { test, expect } from "@playwright/test";
import { questions, questionById, walkTrail } from "../src/questions";
import { allIdeas } from "../src/data";

test("every answer reaches a valid distinct question and the graph has no dead ends", () => {
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  const reached = new Set<string>();
  const queue = ["forest", "dreams", "ocean"];
  while (queue.length) {
    const id = queue.pop()!;
    if (reached.has(id)) continue;
    const q = questionById.get(id);
    expect(q, `Missing question: ${id}`).toBeDefined();
    reached.add(id);
    expect(q!.answers).toHaveLength(3);
    expect(new Set(q!.answers.map((a) => a.next)).size).toBe(3);
    expect(allIdeas.some((e) => e.idea.id === q!.idea)).toBe(true);
    for (const a of q!.answers) {
      expect(a.connection.length).toBeGreaterThan(20);
      queue.push(a.next);
    }
  }
  expect(reached.size).toBe(questions.length);
  const result = walkTrail(
    "forest",
    Array.from({ length: 500 }, (_, i) => i % 3),
  );
  expect(result.steps).toHaveLength(500);
  expect(result.current.answers).toHaveLength(3);
  expect(walkTrail("forest", [0, 9, 1]).choices).toEqual([0]);
  expect(walkTrail("forest", { invalid: true }).choices).toEqual([]);
});

test("answers branch differently, persist, and keep earlier branches when revisited", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#journey/forest?p=");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "Can a forest think?",
  );
  await page
    .getByRole("button", { name: /Yes, if its parts work together/ })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a group smarter than its members?",
  );
  await page.getByRole("button", { name: /Sharing information/ }).click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What would convince you that two plants are communicating?",
  );
  await expect(page.locator(".answer-bridge")).toContainText(
    "Sharing information",
  );
  await page.reload();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What would convince you that two plants are communicating?",
  );
  await page.getByRole("button", { name: "All 3 questions" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Can a forest think/ })
    .click();
  await page.getByRole("button", { name: /Only if it can learn/ }).click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "If an experience changes a plant’s future behavior, is that learning?",
  );
  await expect(page).toHaveURL(/at=learning$/);
  await expect(page.locator('.web-node[data-node-id="signals"]')).toHaveClass(
    /is-discovered/,
  );
  await expect(page.locator('.web-edge[data-edge-id="forest:0"]')).toHaveClass(
    /is-traversed/,
  );
  await page.getByRole("button", { name: "Previous question" }).click();
  await page
    .getByRole("button", { name: /No — thinking needs awareness/ })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "How could you tell whether something is conscious?",
  );
  await page
    .getByRole("button", { name: /It can describe its inner experience/ })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a message meaningful?",
  );
  expect(errors).toEqual([]);
});

test("a shared web reproduces the connections in another browser", async ({
  page,
  browser,
}) => {
  await page.goto("/#journey/ocean?p=01");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "When resources are scarce, what seems the best strategy?",
  );
  const url = page.url();
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Share web" }).click();
  await expect(page.getByRole("status")).toContainText("Web link copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(url);
  await expect(other.locator(".question-stage h1")).toHaveText(
    "When resources are scarce, what seems the best strategy?",
  );
  await expect(other.locator(".web-map-top")).toContainText(
    "3 QUESTIONS · 2 CONNECTIONS",
  );
  await expect(other.locator(".web-node.is-discovered")).toHaveCount(3);
  await context.close();
});

test("starting worlds keep separate webs and restart replaces only the selected web", async ({
  page,
}) => {
  await page.goto("/#journey/forest?p=0");
  await page.getByLabel("Starting world").selectOption("dreams");
  await page.getByRole("button", { name: /The emotions feel real/ }).click();
  await page.getByLabel("Starting world").selectOption("forest");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a group smarter than its members?",
  );
  await page.getByRole("button", { name: "New web", exact: true }).click();
  await page.getByRole("button", { name: "Keep exploring" }).click();
  await expect(page.locator(".web-map-top")).toContainText(
    "2 QUESTIONS · 1 CONNECTION",
  );
  await page.getByRole("button", { name: "New web", exact: true }).click();
  await page.getByRole("button", { name: "Start a new web" }).click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "Can a forest think?",
  );
  await page.getByLabel("Starting world").selectOption("dreams");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "Can an imaginary experience have real consequences?",
  );
});

test("mobile keyboard choices and evidence map remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#journey/forest?p=");
  await page.locator(".answer-option").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a group smarter than its members?",
  );
  await expect(page.locator(".question-stage h1")).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Knowledge map" }).click();
  await expect(page.locator(".detail-content h2")).toHaveText(
    "Intelligence without a brain",
  );
});

test("invalid persisted data and unavailable storage do not block answers", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("rh-journey-v1-forest", '{"bad":"data"}');
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable");
    };
  });
  await page.goto("/#journey/forest");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "Can a forest think?",
  );
  await page
    .getByRole("button", { name: /Yes, if its parts work together/ })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a group smarter than its members?",
  );
  await expect(page.locator(".journey-footer")).toContainText(
    "STORAGE UNAVAILABLE",
  );
});
