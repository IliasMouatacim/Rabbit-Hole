import { test, expect } from "@playwright/test";
test("explore a connection, inspect its source, and save a persistent note", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#forest/forest-root");
  await expect(
    page.getByRole("heading", {
      name: "A little wonder. Endless possibilities.",
    }),
  ).toBeVisible();
  await expect(page.locator(".idea-node")).toHaveCount(6);
  await page
    .getByRole("button", {
      name: /HIDDEN CONNECTIONS The network beneath your feet/,
    })
    .click();
  await expect(page.locator(".detail-content h2")).toHaveText(
    "The network beneath your feet",
  );
  await page.getByRole("tab", { name: /Evidence/ }).click();
  await expect(page.locator(".source-card a")).toHaveAttribute(
    "href",
    "https://doi.org/10.1038/s41559-023-01986-1",
  );
  await page
    .getByRole("button", { name: "Save this idea", exact: true })
    .click();
  await page.getByRole("button", { name: /My collection/ }).click();
  await expect(page.locator(".saved-card")).toHaveCount(1);
  await page
    .getByLabel("YOUR NOTE")
    .fill("Could this help explain resilience?");
  await page.reload();
  await page.getByRole("button", { name: /My collection/ }).click();
  await expect(page.getByLabel("YOUR NOTE")).toHaveValue(
    "Could this help explain resilience?",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export notes" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "rabbit-hole-field-notes.md",
  );
  await page
    .getByRole("button", { name: "Remove The network beneath your feet" })
    .click();
  await expect(
    page.getByText("Your next discovery belongs here."),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("search, change worlds, follow a deep link, and zoom", async ({
  page,
}) => {
  await page.goto("/#forest/forest-root");
  await page
    .getByRole("button", { name: "Find a rabbit hole", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Search ideas" }).fill("light");
  await page.getByRole("button", { name: /A language made of light/ }).click();
  await expect(page.locator(".detail-content h2")).toHaveText(
    "A language made of light",
  );
  await expect(page).toHaveURL(/#ocean\/light$/);
  await page.reload();
  await expect(page.locator(".detail-content h2")).toHaveText(
    "A language made of light",
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.locator(".map-controls")).toContainText("120%");
  await page.getByRole("button", { name: "Reset map view" }).click();
  await expect(page.locator(".map-controls")).toContainText("100%");
  await page
    .getByRole("button", { name: "Find a rabbit hole", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search ideas" })
    .fill("unmapped subject");
  await expect(
    page.getByText("That trail hasn’t been mapped yet."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("mobile navigation and discovery panel work without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#forest/forest-root");
  await page.getByRole("button", { name: "Close idea" }).click();
  await expect(page.locator(".sidebar")).not.toBeInViewport();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Inside the dreaming mind" }).click();
  await page.getByRole("button", { name: "Knowledge map" }).click();
  await page.getByRole("button", { name: "Close idea" }).click();
  await expect(page.locator(".exploration-label h2")).toHaveText(
    "Inside the dreaming mind",
  );
  await page.locator(".root-node").click();
  await expect(page.locator(".detail-panel")).toBeVisible();
  await page
    .getByRole("button", { name: "Save this idea", exact: true })
    .click();
  await page.getByRole("button", { name: "Close idea" }).click();
  await expect(page.locator(".detail-panel")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
