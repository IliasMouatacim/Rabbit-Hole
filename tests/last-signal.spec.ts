import { test, expect } from "@playwright/test";
test("eight calls carry decisions through reload, consequences, and aftermath", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Keep the light on." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Send it to the hospital/ }).click();
  await expect(
    page
      .locator(".consequence p")
      .filter({ hasText: "Twelve patients have another chance." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Answer the next call" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A voice beneath the water." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Send the relay pulse/ }).click();
  await page.getByRole("button", { name: "Answer the next call" }).click();
  await expect(
    page.getByRole("button", { name: /Recover the transmission/ }),
  ).toBeDisabled();
  await page.getByRole("slider", { name: "Radio frequency" }).fill("104.2");
  await page.getByRole("button", { name: /Recover the transmission/ }).click();
  await page.getByRole("button", { name: "Answer the next call" }).click();
  await page
    .getByRole("button", { name: /Verify with the flood sensor/ })
    .click();
  await page.getByRole("button", { name: "Answer the next call" }).click();
  await expect(
    page.getByRole("heading", { name: "A debt repaid." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Give Eli the go-ahead/ }).click();
  await page.getByRole("button", { name: "Answer the next call" }).click();
  await page.getByRole("button", { name: /Dispatch the ambulance/ }).click();
  await page.getByRole("button", { name: "Answer the next call" }).click();
  await page.getByRole("button", { name: /Light the harbour route/ }).click();
  await page.getByRole("button", { name: "Answer the next call" }).click();
  await page.getByRole("button", { name: /Let the city speak/ }).click();
  await page.getByRole("button", { name: "See the aftermath" }).click();
  await expect(
    page.getByText("people reached safety", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Trace your decisions" }).click();
  await expect(page.locator(".archive-entry")).toHaveCount(8);
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: /Other nights/ }).click();
  await expect(
    page.getByRole("button", { name: /^02 The long rain/ }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});
test("mobile settings and city fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Off", exact: true }).last().click();
  await page.getByRole("button", { name: "Close panel" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({
    path: "work/last-signal-mobile.png",
    fullPage: true,
  });
});
test("opening city renders", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1800);
  await page.screenshot({
    path: "work/last-signal-desktop.png",
    fullPage: true,
  });
  await expect(page.locator("canvas")).toBeVisible();
});

test("an exhausted reserve can still finish the night", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "last-signal-run",
      JSON.stringify({
        turn: 7,
        power: 0,
        trust: 20,
        time: 0,
        saved: 50,
        flags: [],
        log: [],
        code: "LONG-RAIN",
        hard: true,
      }),
    ),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Broadcast the safe routes/ }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Keep listening", exact: true })
    .click();
  await page.getByRole("button", { name: "See the aftermath" }).click();
  await expect(
    page.getByText("people reached safety", { exact: true }),
  ).toBeVisible();
});
