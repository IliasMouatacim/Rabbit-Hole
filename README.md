# Rabbit Hole

A curiosity-driven exploration app built with React 19, TypeScript, Vite, Three.js, and Lenis. A cinematic opening leads into an interactive spiderweb of questions: each answer opens a related question while every earlier branch stays visible. Explore 50 curated questions and 150 answer connections across nature, the mind, the ocean, football, and music. The knowledge maps provide sources and context.

## Develop

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

## Validate and build

```sh
npm run build
npx playwright install chromium
npm test
```

In the Linux cloud workspace, run `npm run test:cloud` to use the packaged Chromium browser without an additional browser download.

`npm run preview` serves the production build. Deploy the `dist/` directory to a static host. No API keys or backend are required.

## Features

- Scroll-pinned introduction, a pointer-reactive 3D field, live HUD, and horizontal expedition reel. A single animation loop drives the active scene; reduced-motion and WebGL fallbacks are supported.
- Three answer choices per question, each leading to a different follow-up with a connecting explanation. There is no score or final results screen; paths can reconnect to previously visited questions.
- A simple branch map opens by default: the current question connects to three large answer cards. Choose a card or revisit an earlier question without dragging or zooming. Mobile uses a vertical branch layout and ordinary page scrolling.
- “All connections” opens the complete spiderweb with solid explored connections and dashed possible branches. “Nearby questions” returns to the simple view without changing saved progress. Questions shared by multiple branches reconnect to the same node.
- An “Explored only” view hides unanswered possibilities without deleting anything. Turn it off to reveal every available branch again.
- Revisit any discovered question and choose another answer without losing earlier branches. Follow preview nodes directly, or use the question panel.
- Pan, zoom, pinch, fit the entire web, or center the active question. Keyboard users can tab between nodes, use arrow keys to pan, plus/minus to zoom, and Home to fit the web.
- Automatic web saving per starting world, previous-question navigation, and a list of every discovered question. Starting a new web requires confirmation.
- Reloading your own saved web restores previous-question history. On mobile, persistent “View web” and “Answer question” controls let you jump between the graph and the selected question.
- Evidence detours offer “Back to your web” in the sidebar and source panel. This restores the original subject, selected question, and branches during the visit, even when browser storage is unavailable.
- Question and reset dialogs isolate background controls, lock page scrolling, and restore keyboard focus when dismissed.
- Share links encode every explored connection and the selected question. Shared webs take precedence over the receiving browser's saved web. Older answer-path links and saved trails migrate automatically.
- Five subject maps with 24 source-backed discovery cards and zoom controls.
- A subject bar for switching between saved webs, answer previews, and visible branch progress. Search your discovered questions to return to any thread.
- Football questions explore tactics, talent, pressing, penalties, supporters, and fairness. Music connects rhythm, emotion, identity, and shared experiences; both subjects also connect to the original questions.
- Search across all curated ideas; keyboard shortcut Ctrl/Cmd+K.
- Source links, evidence notes, and follow-up threads.
- Saved ideas and editable field notes, persisted to this browser's local storage.
- Markdown export and shareable hash URLs that open a specific idea.
- Responsive mobile navigation and detail panels.
- Locally bundled fonts; no third-party font requests.

## Scope

This version uses a curated question graph, not live AI generation. Branches can continue indefinitely by reconnecting, but the set of questions is finite. Answer choices express viewpoints and curiosity rather than graded factual answers. Webs, collections, and notes remain in this browser without account sync; a shared web URL also contains the explored answers. Source links are provided for independent review; summaries are editorial content and should be reviewed before a public educational launch.

Data lives in `src/data.ts`, the interface in `src/main.tsx`, and styling in `src/styles.css`. Add a topic by following the `Topic` and `Idea` types. Keep source URLs and uncertainty notes attached to each idea.

The branching graph lives in `src/questions.ts`; `src/extra-subjects.ts` contains the football and music questions and their context cards. Each question needs three distinct destinations and an existing evidence idea ID. Append new questions after existing entries: share links encode edge indices, so reordering published questions or answers would change older links.

- `src/WebJourney.tsx` coordinates question selection, answers, saving, sharing, and dialogs.
- `src/QuestionWeb.tsx` renders the simple branch map, earlier-question buttons, and view switch. `src/WebOverview.tsx` renders the complete network and handles camera gestures using an event-driven animation frame without React state updates during dragging.
- `src/web-layout.ts` assigns deterministic radial positions so branches stay in place when revisited.
- `src/web-state.ts` validates connected edges, preserves branches, and encodes share URLs. Browser storage uses `rh-web-v2-{world}` and migrates `rh-journey-v1-{world}` trails. Legacy `?p=` links remain supported; new links use `?w=` and `at=`.
- `src/Cinematic.tsx` owns the introduction's scroll animation loop; `src/curiosity-scene.ts` renders its 3D artwork without scheduling its own loop.

The test suite covers graph validation and migration, stable layouts, branch preservation, shared-web restoration, camera controls, touch pinching, keyboard exploration, and the cinematic and knowledge-map flows.
