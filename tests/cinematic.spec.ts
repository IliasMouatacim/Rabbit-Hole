import { test, expect } from "@playwright/test";

test("the playable hero leads into pinned storytelling and reel navigation", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Nothing exists/ }),
  ).toBeVisible();
  await expect(page.locator(".cinematic")).toHaveClass(/has-webgl/);
  await page.getByRole("button", { name: "Or start with a question" }).click();
  await page.getByRole("button", { name: "Show me first" }).click();
  await expect(page.locator(".hero-reveal")).toContainText("chemical energy");
  await expect(page.getByLabel("Ocean depth")).toHaveValue("2800");
  await page.getByRole("button", { name: "The idea", exact: true }).click();
  await expect
    .poll(() => page.locator("[data-chapter]").textContent(), {
      timeout: 15000,
    })
    .toContain("02");
  await expect(page.locator(".story-stage")).toBeInViewport();
  await page.getByRole("button", { name: "The worlds", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Every question/ }),
  ).toBeInViewport({ timeout: 15000 });
  await page.getByRole("button", { name: "Next expedition" }).click();
  await expect(
    page.getByRole("button", { name: "Show Inside the dreaming mind" }),
  ).toHaveAttribute("aria-pressed", "true", { timeout: 15000 });
  await page
    .locator(".world-1")
    .getByRole("button", { name: "Enter this world" })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a dream feel real while you’re in it?",
  );
  await expect(page).toHaveURL(/#journey\/dreams\?w=&at=dreams$/);
  await expect(page.locator(".cinematic")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("reduced motion provides a native snap reel and usable map entry", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".cinematic")).toHaveClass(/motion-off/);
  await expect(
    page.getByRole("button", { name: "Enable motion" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "The worlds", exact: true }).click();
  await page
    .getByRole("button", { name: "Show The ocean’s other world" })
    .click();
  await expect(page.locator(".world-2")).toBeInViewport();
  await page
    .locator(".world-2")
    .getByRole("button", { name: "Enter this world" })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "Could life thrive without sunlight?",
  );
});

test("mobile experience fits the screen and can bypass the introduction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".cinematic")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Reduce motion" }).click();
  await expect(page.locator(".cinematic")).toHaveClass(/motion-off/);
  await page
    .getByRole("button", { name: "Try your first question", exact: true })
    .click();
  await expect(page.locator(".answer-option")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Rabbit Hole — return to the descent" })
    .click();
  await expect(page.locator("#cinema-title")).toBeVisible();
});

test("WebGL failure retains a usable visual fallback and entry point", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".cinematic")).toHaveClass(/no-webgl/);
  await expect(page.locator(".portal-fallback")).toBeVisible();
  await page
    .getByRole("button", { name: "Try your first question", exact: true })
    .click();
  await expect(page.locator(".answer-option")).toHaveCount(3);
});
