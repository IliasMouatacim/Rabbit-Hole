# Rabbit Hole

A curiosity-driven exploration app built with React 19, TypeScript, Vite, Three.js, and Lenis. A cinematic opening leads into a branching conversation: each answer selects a related question, with 35 curated questions and 105 answer connections across forests, dreams, and the deep ocean. The existing knowledge maps provide sources and context.

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
- Automatic trail saving per starting world, previous-question navigation, and a complete trail for rewinding and trying another answer.
- Share links encode the full answer path in the URL. Shared paths take precedence over the receiving browser's saved trail.
- Three interactive maps with connected discovery cards and zoom controls.
- Search across all curated ideas; keyboard shortcut Ctrl/Cmd+K.
- Source links, evidence notes, and follow-up threads.
- Saved ideas and editable field notes, persisted to this browser's local storage.
- Markdown export and shareable hash URLs that open a specific idea.
- Responsive mobile navigation and detail panels.
- Locally bundled fonts; no third-party font requests.

## Scope

This version uses a curated question graph, not live AI generation. Branches can continue indefinitely by reconnecting, but the set of questions is finite. Answer choices express viewpoints and curiosity rather than graded factual answers. Trails, collections, and notes remain in this browser without account sync; a shared trail URL also contains the selected answers. Source links are provided for independent review; summaries are editorial content and should be reviewed before a public educational launch.

Data lives in `src/data.ts`, the interface in `src/main.tsx`, and styling in `src/styles.css`. Add a topic by following the `Topic` and `Idea` types. Keep source URLs and uncertainty notes attached to each idea.

The branching graph lives in `src/questions.ts`; `QuestionJourney.tsx` handles choices, persistence, share links, and history. Each question needs three distinct destinations and an existing evidence idea ID. `walkTrail` validates saved paths and stops at invalid steps. `Cinematic.tsx` owns the scroll animation loop, and `curiosity-scene.ts` renders the shared 3D artwork without scheduling its own loop.
