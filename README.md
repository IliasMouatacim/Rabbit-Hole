# Rabbit Hole

A curiosity-driven exploration app built with React 19, TypeScript, Vite, Three.js, and Lenis. A playable ocean question opens the experience. Each answer then reveals a sourced discovery and an experiment before inviting another choice. Explore 50 curated questions and 150 answer connections across nature, the mind, the ocean, football, and music; the spiderweb preserves every branch.

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

- Playable homepage: guess whether life can thrive without sunlight, discover a hydrothermal-vent food web, then enter the Ocean or follow the connection toward life elsewhere. The interaction works without WebGL. Question and subject counts come from the content.
- Scroll-pinned storytelling, a 3D background, live HUD, and horizontal expedition reel. A single animation loop drives the active scene; reduced-motion and WebGL fallbacks are supported.
- Choose → discover → play → choose again. Evidence, limitations, sources, and saving appear in the main discovery panel. Explore gives the reading room priority; My map expands the same connected spiderweb.
- The discovery step survives a reload when browser storage is available; experiment settings reset. The pending step uses `rh-discovery-{world}` alongside the existing saved web.
- Five illustrated experiments: break a network link, reinterpret a figure–ground image, change ocean depth, reposition teammates on a pitch, and compare an original melody at different tempos and timbres. Audio plays only after a click and stops when leaving the experiment.
- Cross-subject discoveries explain the connection and highlight its two nodes and connecting edge. Saved discoveries use the existing collection and are marked on the web.
- Share a journey summary containing the actual starting and current questions, up to three distinct visited discoveries, the first cross-world connection if present, and a miniature of the first eight visited questions. The link preserves the entire web, including alternative branches.
- Three answer choices per question, each leading to a different follow-up with a connecting explanation. There is no score or final results screen; paths can reconnect to previously visited questions.
- A radial spiderweb with solid explored connections and dashed possible branches. Questions shared by multiple branches reconnect to the same node.
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

Experiments are illustrations, not scientific simulations. The network models undirected connectivity with one failed link; the pitch uses static line clearance with a fixed defender and ball carrier; ocean scenes combine representative habitats rather than one surveyed location. The ambiguous image is not a psychological test, and the melody does not prescribe an emotional response. Their assumptions appear beside the controls. Input settings are temporary and are not included in shared web links.

For an initial usability session, start at the playable Ocean question, descend to the vents, save a discovery, follow toward life elsewhere, and try an alternative answer. Ask the visitor to explain one thing they learned and note whether they voluntarily continue. Automated tests verify behavior and accessibility basics; they do not establish learning outcomes or a measured five-minute completion time.

Data lives in `src/data.ts`, the interface in `src/main.tsx`, and styling in `src/styles.css`. Add a topic by following the `Topic` and `Idea` types. Keep source URLs and uncertainty notes attached to each idea.

The branching graph lives in `src/questions.ts`; `src/extra-subjects.ts` contains the football and music questions and their context cards. Each question needs three distinct destinations and an existing evidence idea ID. Append new questions after existing entries: share links encode edge indices, so reordering published questions or answers would change older links.

- `src/WebJourney.tsx` coordinates question selection, answers, saving, sharing, and dialogs.
- `src/HeroDiscovery.tsx` provides the first playable question; `src/Discovery.tsx` presents the discovery step and evidence. `src/Experiments.tsx` contains the five small interactive illustrations.
- `src/journey-story.ts` derives summaries from actual visited edges, and `src/JourneyStory.tsx` renders the miniature and sharing controls.
- `src/QuestionWeb.tsx` renders nodes and connections and handles camera gestures. Camera updates use an event-driven animation frame without React state updates during dragging.
- `src/web-layout.ts` assigns deterministic radial positions so branches stay in place when revisited.
- `src/web-state.ts` validates connected edges, preserves branches, and encodes share URLs. Browser storage uses `rh-web-v2-{world}` and migrates `rh-journey-v1-{world}` trails. Legacy `?p=` links remain supported; new links use `?w=` and `at=`.
- `src/Cinematic.tsx` owns the introduction's scroll animation loop; `src/curiosity-scene.ts` renders its 3D artwork without scheduling its own loop.

The test suite covers graph validation and migration, stable layouts, branch preservation, shared-web restoration, camera controls, touch pinching, keyboard exploration, and the cinematic and knowledge-map flows.

### Thread: integrated expeditions

The opening's primary action and the question journey's **Play Thread** button enter `#play/ocean` (or the selected world). Movement, playable encounters, sourced discoveries, upgrades, threat, and final escape now belong to one run. **Discovery archive** keeps the opinion-based questions and reading map available separately; subjective opinions are never scored as wrong.

Ocean is the reference expedition: stabilise an illustrative vent habitat, repeat an echo sequence, and route oxygen through two valves. Taking a fragment awards its source-backed discovery and 4 energy. The first fragment upgrades Scan with energy recovery and wakes a pursuing creature. The third opens a seven-move escape (five in Deep Dive), during which threads can collapse without disconnecting the exit. The game is turn-based: there is no real-time timer. An 8–12 minute target needs human playtesting; automated completion time does not establish play duration or enjoyment.

Seeded charts combine Y, fork, and bridge pieces into a 19-site web. Hazards cost 3 energy instead of 1; air pockets restore 5 once. Scan reveals secret threads; Shield absorbs one hazard or creature hit; Reroute costs 2 energy to create a useful link. Optional merchant/probe events offer explicit trades. The hidden garden awards resources and a secret ending. The displayed red path predicts the creature's next step; contact costs 4 energy. Failure explains the fatal move. Practice permits undo of the last movement, including failure and its associated encounters; Expedition does not. Unfinished runs restart at briefing after reload.

Nature uses a connectivity repair challenge, Mind uses visual memory, Football uses movable passing lanes, and Music uses reproducible visual/optional audio motifs. These worlds currently share the expedition threat and escape rules; they do not yet have independent enemy systems or full campaigns. Experiment assumptions and source links stay attached to recovered knowledge. No WebGL is required for expeditions. Sound starts off, and reduced motion removes movement/ambient animations.

Challenge URLs include `seed`, `kit`, `mode`, and `hard`; matching these and the world reproduces the map and rules. The daily seed follows the Europe/Paris calendar. Up to 60 local results persist in `rh-expedition-records`; bests compare matching seeds and rules, with Practice separate. A successful Expedition unlocks Guardian, and the log recognises a secret escape and a Deep Dive win. There is no shared leaderboard, account, or influence over another player's run.

`src/expedition-engine.ts` owns deterministic chart generation and transitions. `src/Expedition.tsx` renders the expedition, and `src/ExpeditionEncounter.tsx` implements its playable discoveries. `tests/expedition.spec.ts` checks 75 seeds in both difficulties, a full browser run, different world encounters, loss/retry, abilities, practice undo, records, and mobile behavior. The original `thread-engine.ts` remains covered as the earlier route puzzle model; the production `#play` route uses the expedition engine.
