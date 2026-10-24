import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`simple branches work without camera controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#journey/football?p=");
    await expect(page.locator(".nearby-branch")).toHaveCount(3);
    await expect(page.locator(".web-camera-controls")).toHaveCount(0);
    await expect(page.locator(".nearby-current")).toContainText(
      "What really wins a football match?",
    );
    await page
      .getByRole("button", {
        name: "Explore question: Your team has less talent. How do you compete?",
        exact: true,
      })
      .click();
    await expect(page.locator(".nearby-current")).toContainText(
      "Your team has less talent",
    );
    await expect(page.locator(".simple-web-header")).toContainText(
      "2 questions · 1 connection",
    );
    await page
      .getByRole("button", {
        name: "Open question: What really wins a football match?",
        exact: true,
      })
      .click();
    const branch = page.getByRole("button", {
      name: "Explore question: What would you want most from a young player?",
      exact: true,
    });
    await branch.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".nearby-current")).toContainText("young player");
    await expect(page.locator(".nearby-current")).toBeInViewport();
    await expect(
      page.getByRole("navigation", { name: "Revisit questions" }),
    ).toContainText("Your team has less talent");
    const url = page.url();
    await page
      .getByRole("button", { name: "All connections", exact: true })
      .click();
    await expect(page.locator(".web-node.is-discovered")).toHaveCount(3);
    await page
      .getByRole("button", { name: "Nearby questions", exact: true })
      .click();
    await expect(page).toHaveURL(url);
    await expect(page.locator(".nearby-branch")).toHaveCount(3);
    await page.reload();
    await expect(page.locator(".nearby-current")).toContainText("young player");
    await expect(page.locator(".simple-web-header")).toContainText(
      "3 questions · 2 connections",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
