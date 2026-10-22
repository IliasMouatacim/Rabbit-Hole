import { test, expect } from "@playwright/test";

test("the pinned journey responds to scrolling, dragging, and reel navigation", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Curiosity has/ }),
  ).toBeVisible();
  await expect(page.locator(".cinematic")).toHaveClass(/has-webgl/);
  const field = page.getByRole("img", {
    name: /Interactive 3D curiosity field/,
  });
  await field.focus();
  const before = await page.locator(".curiosity-canvas").screenshot();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(250);
  const after = await page.locator(".curiosity-canvas").screenshot();
  expect(before.equals(after)).toBe(false);
  const box = await field.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + 100,
    box!.y + box!.height / 2 + 20,
    { steps: 5 },
  );
  await page.mouse.up();
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
  await expect(page).toHaveURL(/#journey\/dreams\?p=$/);
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
    .getByRole("button", { name: "Start exploring", exact: true })
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
    .getByRole("button", { name: "Start exploring", exact: true })
    .click();
  await expect(page.locator(".answer-option")).toHaveCount(3);
});
