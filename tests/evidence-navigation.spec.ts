import { test, expect } from "./journey-fixture";

test("mobile evidence detours return to the original cross-subject web without storage", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.goto("/#journey/music?p=200");
  await expect(page.locator(".question-stage h1")).toContainText(
    "club feel like part",
  );
  const original = page.url();
  await page.getByRole("button", { name: "Knowledge map" }).click();
  await expect(page.locator(".detail-content")).toContainText(
    "The rules and the people",
  );
  await page
    .locator(".detail-content")
    .getByRole("button", { name: "Back to your web" })
    .click();
  await expect(page).toHaveURL(original);
  await expect(page.locator(".question-stage h1")).toContainText(
    "club feel like part",
  );
  await expect(page.locator(".web-node.is-discovered")).toHaveCount(4);
  await page
    .getByRole("button", { name: /The memories attached to the badge/ })
    .click();
  await expect(page.locator(".question-stage h1")).toContainText("memory");
});

test("web dialogs isolate background controls, lock scrolling, and restore focus", async ({
  page,
}) => {
  await page.goto("/#journey/football?p=0");
  const opener = page.getByRole("button", { name: "All 2 questions" });
  await opener.click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close questions" });
  await expect(close).toBeFocused();
  await expect(page.locator(".web-content")).toHaveJSProperty("inert", true);
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");
  await page
    .locator(".web-share")
    .evaluate((button: HTMLButtonElement) => button.focus());
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: /Your team has less talent/ }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".question-stage h1")).toBeFocused();
  await expect(page.locator(".web-content")).toHaveJSProperty("inert", false);
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
  await page.getByRole("button", { name: "New web", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Keep exploring" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "New web", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".web-content")).toHaveJSProperty("inert", false);
});
