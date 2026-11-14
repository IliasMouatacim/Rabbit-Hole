# LAST SIGNAL

A cinematic, browser-local game about running the last radio station during a citywide blackout. The opening emergency call is immediately playable.

## Run

```sh
npm install
npm run dev
```

`npm run build` produces the static site in `dist/`.

## Verify

```sh
npm run test:cloud
```

The packaged Chromium tests cover a complete eight-call run, returning consequences, radio tuning, saved progress, scenario unlocks, mobile layout, settings, rendering, and finishing with exhausted resources. Use `npm test` with a locally installed Playwright browser.

## Experience

- Procedural Three.js city with rain, changing district lights, a railway, and a camera that follows the current district.
- Eight branching calls, power and time budgets, public trust, and later consequences tied to earlier decisions.
- A working frequency dial; 104.2 MHz recovers the hidden transmission.
- Aftermath and decision timeline, discovered case files, replay, a harder variant, and shareable scenario codes.
- Daily codes select the shared harder variant; they do not yet generate new narrative content.
- Synthesized ambient radio/rain sound, atmosphere captions, reduced motion, and automatic browser-local progress.

Time is spent on decisions rather than on a real-time countdown. Public trust affects whether families follow the final safe-route broadcast. Resource exhaustion always leaves a way to continue to the aftermath.

## Source

`src/game.ts` defines calls and consequences. `src/City.tsx` renders the city. `src/main.tsx` contains the station UI and run state. `src/signal.css` defines the responsive design.

Progress is stored only in the current browser. Share copies the scenario code and URL, so another player starts the same situation independently.
