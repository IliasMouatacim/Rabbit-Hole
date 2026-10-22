import { test, expect } from "@playwright/test";
import { emptyWeb, followAnswer, selectDiscovered, goBack, webFromTrail, webHash, webFromHash, loadWeb, validateWeb, visibleWeb } from "../src/web-state";

test("returning to a question preserves both branches and their descendants", () => {
  let state = followAnswer(followAnswer(emptyWeb("forest"), 0), 0);
  state = selectDiscovered("forest", state, "forest");
  state = followAnswer(state, 1);
  expect(state.edges).toEqual(["forest:0", "collective:0", "forest:1"]);
  expect(visibleWeb("forest", state).discovered).toEqual(new Set(["forest", "collective", "signals", "learning"]));
  expect(goBack(state).edges).toEqual(state.edges);
  expect(goBack(state).selected).toBe("forest");
  expect(visibleWeb("forest", state).nodes).toContain("awareness");
  expect(visibleWeb("forest", state).nodes).toContain("trade");
});

test("revisited questions merge into existing nodes and edges", () => {
  let state = followAnswer(emptyWeb("forest"), 0);
  state = followAnswer(selectDiscovered("forest", state, "forest"), 0);
  expect(state.edges).toEqual(["forest:0"]);
  expect(new Set(visibleWeb("forest", state).nodes).size).toBe(visibleWeb("forest", state).nodes.length);
});

test("sharing serializes the whole web, including alternatives", () => {
  let state = webFromTrail("forest", [0, 0]);
  state = followAnswer(selectDiscovered("forest", state, "forest"), 2);
  const shared = webFromHash("forest", webHash("forest", state))!;
  expect(shared.edges).toEqual(state.edges);
  expect(shared.selected).toBe("awareness");
});

test("legacy paths migrate without losing their connections", () => {
  const state = loadWeb("forest", "#journey/forest", { getItem: key => key.includes("v1") ? "[0,0,1]" : null });
  expect(state.edges).toEqual(["forest:0", "collective:0", "signals:1"]);
  expect(state.selected).toBe("trade");
  expect(webFromHash("forest", "#journey/forest?p=00")?.edges).toEqual(["forest:0", "collective:0"]);
  expect(loadWeb("forest", "#journey/forest?w=&at=forest", { getItem: () => "[0]" }).edges).toEqual([]);
});

test("invalid or disconnected data cannot create imaginary branches", () => {
  const result = validateWeb("forest", { edges: ["no-such-edge", "dreams:0", "collective:0", "forest:0", "forest:0"], selected: "alien", history: ["alien", "collective"] });
  expect(result.edges).toEqual(["forest:0", "collective:0"]);
  expect(result.selected).toBe("forest");
  expect(result.history).toEqual(["collective"]);
  expect(webFromHash("forest", "#journey/forest?w=invalid&at=alien")?.edges).toEqual([]);
});
