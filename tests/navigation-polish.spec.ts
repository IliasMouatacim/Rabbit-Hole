import { test, expect } from "./journey-fixture";

test("explored-only view removes previews without deleting branches or hiding new answers", async ({
  page,
}) => {
  await page.goto("/#journey/football?p=");
  const toggle = page.getByRole("button", {
    name: "Explored only",
    exact: true,
  });
  await toggle.click();
  await expect(page.locator(".web-node")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("first connection");
  await page
    .getByRole("button", { name: /A system that makes everyone better/ })
    .click();
  await expect(page.locator(".web-node")).toHaveCount(2);
  await expect(page.locator(".web-edge")).toHaveCount(1);
  await expect(page.locator(".web-focus-hint")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Previous question", exact: true })
    .click();
  await page
    .getByRole("button", { name: /One player who changes everything/ })
    .click();
  await expect(page.locator(".web-node")).toHaveCount(3);
  for (const node of await page.locator(".web-node").all())
    await expect(node).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /View web/ }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const controls = document
          .querySelector(".web-camera-controls")!
          .getBoundingClientRect();
        return [...document.querySelectorAll(".web-node")].every(
          (node) => node.getBoundingClientRect().bottom < controls.top,
        );
      }),
    )
    .toBe(true);
  await toggle.click();
  await expect(page.locator(".web-node.is-preview").first()).toBeVisible();
  await expect(page.locator(".web-node.is-discovered")).toHaveCount(3);
});

test("mobile jump controls and previous-question history work after reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#journey/football?p=");
  const dock = page.getByRole("navigation", {
    name: "Jump between web and question",
  });
  await dock.getByRole("button", { name: /Answer question/ }).click();
  await expect(page.locator(".question-stage h1")).toBeInViewport();
  await page
    .getByRole("button", { name: /A system that makes everyone better/ })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Previous question", exact: true })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What really wins a football match?",
  );
  await dock.getByRole("button", { name: /View web/ }).click();
  await expect(page.locator(".web-viewport")).toBeInViewport();
  await expect(page.locator(".web-viewport")).toBeFocused();
  await dock.getByRole("button", { name: /Answer question/ }).click();
  await expect(page.locator(".question-stage h1")).toBeFocused();
  await page.getByRole("button", { name: "All 2 questions" }).click();
  await expect(dock).toHaveCount(0);
  await page.getByRole("button", { name: "Close questions" }).click();
  await expect(dock).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
