import { test as base, expect } from "@playwright/test";

// Existing navigation regressions continue through the new, explicit discovery
// step. discovery.spec.ts tests that step itself without this helper.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addLocatorHandler(
      page.getByRole("button", {
        name: "Choose where to go next",
        exact: true,
      }),
      async () => {
        await page
          .getByRole("button", { name: "Choose where to go next", exact: true })
          .click();
      },
    );
    await use(page);
  },
});
export { expect };
