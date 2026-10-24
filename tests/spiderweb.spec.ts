import { test, expect } from "@playwright/test";

test("the canvas grows multiple branches and reconnects without duplicate nodes", async ({
  page,
  browser,
}) => {
  await page.goto("/#journey/forest?p=");
  await page
    .getByRole("button", { name: "All connections", exact: true })
    .click();
  await expect(page.locator(".web-node")).toHaveCount(4);
  await page
    .getByRole("button", { name: /Yes, if its parts work together/ })
    .click();
  await page.getByRole("button", { name: /Sharing information/ }).click();
  await page
    .getByRole("button", { name: "Open question: Can a forest think?" })
    .click();
  await page.getByRole("button", { name: /Only if it can learn/ }).click();
  await expect(page.locator(".web-node.is-discovered")).toHaveCount(4);
  await expect(page.locator('.web-node[data-node-id="signals"]')).toHaveClass(
    /is-discovered/,
  );
  await expect(page.locator(".web-edge.is-traversed")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Open question: Can a forest think?" })
    .click();
  await expect(
    page.getByRole("button", { name: /Yes, if its parts work together/ }),
  ).toContainText("ALREADY IN YOUR WEB");
  await page
    .getByRole("button", { name: /Yes, if its parts work together/ })
    .click();
  await expect(page.locator(".web-node.is-discovered")).toHaveCount(4);
  await expect(page.locator(".web-edge.is-traversed")).toHaveCount(3);
  await page.reload();
  await page
    .getByRole("button", { name: "All connections", exact: true })
    .click();
  await expect(page.locator(".web-node.is-discovered")).toHaveCount(4);
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(page.url());
  await other
    .getByRole("button", { name: "All connections", exact: true })
    .click();
  await expect(other.locator('.web-node[data-node-id="signals"]')).toHaveClass(
    /is-discovered/,
  );
  await expect(other.locator('.web-node[data-node-id="learning"]')).toHaveClass(
    /is-discovered/,
  );
  await expect(other.locator(".web-edge.is-traversed")).toHaveCount(3);
  await context.close();
});

test("unexplored nodes can be followed directly and canvas controls work", async ({
  page,
}) => {
  await page.goto("/#journey/forest?p=");
  await page
    .getByRole("button", { name: "All connections", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Explore question: What makes a group smarter than its members?",
    })
    .click();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a group smarter than its members?",
  );
  await expect(page.locator('.web-edge[data-edge-id="forest:0"]')).toHaveClass(
    /is-traversed/,
  );
  await page.getByRole("button", { name: "Fit entire web" }).click();
  const initial = await page.locator(".web-camera-controls>span").textContent();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.locator(".web-camera-controls>span")).not.toHaveText(
    initial!,
  );
  await page.getByRole("button", { name: "Fit entire web" }).click();
  await expect(page.locator(".web-camera-controls>span")).toHaveText(initial!);
  const plane = page.locator(".web-plane");
  const before = await plane.getAttribute("style");
  const area = await page.locator(".web-viewport").boundingBox();
  await page.mouse.move(area!.x + 25, area!.y + 90);
  await page.mouse.down();
  await page.mouse.move(area!.x + 130, area!.y + 130, { steps: 8 });
  await page.mouse.up();
  await expect(plane).not.toHaveAttribute("style", before!);
  await page.getByRole("button", { name: "Center selected question" }).click();
  await expect(page.locator(".web-node.is-selected")).toBeInViewport();
});

test("touch gestures zoom the web while the active question remains usable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/#journey/forest?p=");
  await page
    .getByRole("button", { name: "All connections", exact: true })
    .click();
  await page.locator(".web-node").first().waitFor();
  const area = await page.locator(".web-viewport").boundingBox();
  const before = await page.locator(".web-camera-controls>span").textContent();
  const cdp = await context.newCDPSession(page);
  const y = area!.y + 80,
    x = area!.x + area!.width / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 30, y, id: 0 },
      { x: x + 30, y, id: 1 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 75, y, id: 0 },
      { x: x + 75, y, id: 1 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".web-camera-controls>span")).not.toHaveText(
    before!,
  );
  await page
    .getByRole("button", { name: /Yes, if its parts work together/ })
    .tap();
  await expect(page.locator(".question-stage h1")).toHaveText(
    "What makes a group smarter than its members?",
  );
  await context.close();
});

test("mobile keyboard exploration preserves the full web and stays within the screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#journey/forest?p=00");
  await page
    .getByRole("button", { name: "All connections", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open question: Can a forest think?" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".question-stage h1")).toHaveText(
    "Can a forest think?",
  );
  await page.getByRole("button", { name: /Only if it can learn/ }).click();
  await expect(page.locator(".web-node.is-discovered")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "All 4 questions" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "All 4 questions" }),
  ).toBeFocused();
});
