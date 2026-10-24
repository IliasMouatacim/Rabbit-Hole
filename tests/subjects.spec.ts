import { test, expect } from "@playwright/test";
import { webFromHash } from "../src/web-state";

test("adding subjects keeps existing shared edge indices compatible", () => {
  expect(
    webFromHash("forest", "#journey/forest?w=0.3.1&at=learning")?.edges,
  ).toEqual(["forest:0", "collective:0", "forest:1"]);
});

test("football branches survive subject switching, search, reload and sharing", async ({
  page,
  browser,
}) => {
  await page.goto("/#journey/football?p=");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What really wins a football match?",
  );
  await page
    .getByRole("button", { name: /A system that makes everyone better/ })
    .hover();
  await expect(page.locator(".branch-preview")).toContainText(
    "Your team has less talent",
  );
  await page
    .getByRole("button", { name: /A system that makes everyone better/ })
    .click();
  await page
    .getByRole("button", { name: /Press together and force mistakes/ })
    .click();
  await page.getByRole("button", { name: /All 3 questions/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Search discovered questions")
    .fill("no matching question");
  await expect(dialog.getByRole("status")).toHaveText(
    "No questions match. Try another word.",
  );
  await dialog.getByLabel("Search discovered questions").fill("really wins");
  await dialog.getByRole("button", { name: /What really wins/ }).click();
  await page
    .getByRole("button", { name: /One player who changes everything/ })
    .click();
  await expect(
    page.locator('.web-node[data-node-id="football-pressing"]'),
  ).toHaveClass(/is-discovered/);
  const rail = page.getByRole("navigation", { name: "Explore subjects" });
  await rail.getByRole("button", { name: /Music/ }).click();
  await expect(page.locator(".question-stage h1")).toContainText("one song");
  await rail.getByRole("button", { name: /Football/ }).click();
  await expect(page.locator(".question-stage h1")).toContainText(
    "young player",
  );
  await page.reload();
  await expect(page.locator(".web-map-top")).toContainText(
    "4 QUESTIONS · 3 CONNECTIONS",
  );
  const context = await browser.newContext();
  const shared = await context.newPage();
  await shared.goto(page.url());
  await expect(shared.locator(".question-stage h1")).toContainText(
    "young player",
  );
  await expect(
    shared.locator('.web-node[data-node-id="football-pressing"]'),
  ).toHaveClass(/is-discovered/);
  await context.close();
});

test("mobile music branches connect to football with working evidence and no overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#journey/music?p=");
  await page
    .getByRole("button", { name: /It expresses something I couldn’t say/ })
    .click();
  await page
    .getByRole("button", { name: /It makes me feel understood/ })
    .click();
  await page
    .getByRole("button", { name: /Yes — it becomes a sense of belonging/ })
    .click();
  await expect(page.locator(".question-stage h1")).toContainText(
    "club feel like part",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Explore subjects" })
      .getByRole("button", { name: /Music/ }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Knowledge map" }).click();
  await expect(page.locator(".detail-content")).toContainText(
    "The rules and the people",
  );
  await page.getByRole("tab", { name: /Evidence & questions/ }).click();
  await expect(
    page.locator(
      '.detail-content a[href="https://www.theifab.com/laws/latest/"]',
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("new subjects can be entered from the cinematic opening", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Football", exact: true }).click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What really wins a football match?",
  );
});
