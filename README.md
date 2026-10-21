# Rabbit Hole

A curiosity-driven exploration app built with React 19, TypeScript, and Vite. Interactive maps connect 18 curated ideas across forests, dreams, and the deep ocean. Every idea has a source and an explicit discussion of uncertainty.

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

- Three interactive maps with connected discovery cards and zoom controls.
- Search across all curated ideas; keyboard shortcut Ctrl/Cmd+K.
- Source links, evidence notes, and follow-up threads.
- Saved ideas and editable field notes, persisted to this browser's local storage.
- Markdown export and shareable hash URLs that open a specific idea.
- Responsive mobile navigation and detail panels.
- Locally bundled fonts; no third-party font requests.

## Scope

This version is a curated exploration experience, not an AI answer generator. Arbitrary questions do not generate new maps. Collections and notes remain in this browser, without account sync. Source links are provided for independent review; summaries are editorial content and should be reviewed before a public educational launch.

Data lives in `src/data.ts`, the interface in `src/main.tsx`, and styling in `src/styles.css`. Add a topic by following the `Topic` and `Idea` types. Keep source URLs and uncertainty notes attached to each idea.
