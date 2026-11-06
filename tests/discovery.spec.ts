import { test, expect, type Page } from "@playwright/test";
import { journeyStory } from "../src/journey-story";
import { webFromTrail } from "../src/web-state";

const next = (page: Page) =>
  page
    .getByRole("button", { name: "Choose where to go next", exact: true })
    .click();

test("homepage offers a playable question without WebGL and leads to the ocean", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return getContext.apply(this, [type, ...args] as never);
    } as typeof getContext;
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Could life thrive without sunlight?" }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: "No, everything needs sunlight" })
    .click();
  await expect(page.locator(".hero-reveal")).toContainText(
    "surprising exception",
  );
  await page.getByLabel("Ocean depth").fill("0");
  await expect(page.locator(".experiment-result")).toContainText(
    "near the surface",
  );
  await page.getByLabel("Ocean depth").fill("3000");
  await expect(page.locator(".experiment-result")).toContainText(
    "chemical reactions",
  );
  await expect(page.locator(".annotation-coordinates")).toContainText(
    "QUESTIONS / 050",
  );
  await expect(page.locator(".annotation-coordinates")).toContainText(
    "WORLDS / 005",
  );
  await page
    .getByRole("button", { name: /Follow this toward alien life/ })
    .click();
  await expect(page).toHaveURL(/#journey\/ocean\?w=.*at=alien/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("an answer reveals evidence and a working network before the next choice", async ({
  page,
}) => {
  await page.goto("/#journey/forest?p=");
  await page
    .getByRole("button", { name: /Yes, if its parts work together/ })
    .click();
  await expect(
    page.getByRole("region", { name: "Your discovery" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Choose your answer" }),
  ).toBeHidden();
  await page
    .getByRole("button", { name: "Remove connection", exact: true })
    .click();
  await expect(page.locator(".experiment-heading strong")).toHaveText(
    "3 / 6 connected",
  );
  await page
    .getByRole("button", { name: "Add a backup route", exact: true })
    .click();
  await expect(page.locator(".experiment-heading strong")).toHaveText(
    "6 / 6 connected",
  );
  await expect(page.locator(".discovery-evidence a")).toHaveAttribute(
    "href",
    /^https:/,
  );
  await page
    .getByRole("button", { name: "Save discovery", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Discovery saved" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".saved-node-dot").first()).toBeAttached();
  await expect(page.locator(".saved-node-dot").first()).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("rh-saved") || "[]").some(
        (entry: { id: string }) => entry.id === "intelligence",
      ),
    ),
  ).toBe(true);
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Your discovery" }),
  ).toBeVisible();
  await next(page);
  await expect(
    page.getByRole("group", { name: "Choose your answer" }),
  ).toBeVisible();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a group smarter than its members?",
  );
  await page.getByRole("button", { name: /2 See what you found/ }).click();
  await expect(
    page.getByRole("region", { name: "Your discovery" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Next question/ }).click();
  await expect(
    page.getByRole("group", { name: "Choose your answer" }),
  ).toBeVisible();
});

test("mind, football and music provide distinct accessible interactions", async ({
  page,
}) => {
  await page.goto("/#journey/dreams?p=");
  await page.getByRole("button", { name: /The emotions feel real/ }).click();
  await page.getByRole("button", { name: "Two faces", exact: true }).click();
  await expect(page.locator(".experiment-result")).toContainText(
    "pale shape in the center",
  );
  await page
    .getByRole("navigation", { name: "Explore subjects" })
    .getByRole("button", { name: /^Football/ })
    .click();
  await page
    .getByRole("button", { name: /A system that makes everyone better/ })
    .click();
  await page
    .getByRole("button", { name: "Move player 3", exact: true })
    .focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowUp");
  await expect(page.locator(".experiment-heading strong")).toHaveText(
    "3 open lanes",
  );
  await page
    .getByRole("navigation", { name: "Explore subjects" })
    .getByRole("button", { name: /^Music/ })
    .click();
  await page
    .getByRole("button", { name: /It expresses something I couldn’t say/ })
    .click();
  await page.getByRole("button", { name: "Play melody", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop melody", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Melody tempo").fill("150");
  await expect(
    page.getByRole("button", { name: "Play melody", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Melody sound").selectOption("triangle");
  await page.getByRole("button", { name: "Play melody", exact: true }).click();
  await page.getByRole("button", { name: "Stop melody", exact: true }).click();
  await expect(page.locator(".experiment-heading strong")).toHaveText(
    "150 BPM",
  );
});

test("cross-world discoveries explain and highlight the actual connection", async ({
  page,
}) => {
  await page.goto("/#journey/football?p=00");
  await page
    .getByRole("button", { name: /Everyone closes the next passing options/ })
    .click();
  await expect(page.locator(".connection-reward")).toContainText(
    "Football ↔ Nature",
  );
  await expect(page.locator(".connection-reward")).toContainText(
    "coordinated network",
  );
  await expect(page.locator(".web-node.connection-found")).toHaveCount(2);
  await expect(page.locator(".web-edge.connection-found")).toHaveCount(1);
  await page.locator(".journey-story summary").click();
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: "Copy my journey", exact: true })
    .click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("What really wins a football match?");
  expect(copied).toContain("coordinated network");
  expect(copied).toContain("#journey/football?w=");
});

test("journey summaries use real visited discoveries rather than invented milestones", () => {
  const story = journeyStory("ocean", webFromTrail("ocean", [0, 0, 1]));
  expect(story.start).toBe("Could life thrive without sunlight?");
  expect(story.discoveries.map((idea) => idea.id)).toEqual(["vents", "alien"]);
  expect(story.connection).toBeNull();
  expect(story.text).not.toContain("football");
});
