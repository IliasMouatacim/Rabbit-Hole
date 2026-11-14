import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Radio,
  Activity,
  Volume2,
  VolumeX,
  Settings,
  FolderOpen,
  X,
  Zap,
  Clock,
  Users,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  ChevronRight,
  RotateCcw,
  Check,
  Headphones,
  Share2,
} from "lucide-react";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import City from "./City";
import { getCall, type Choice } from "./game";
import "./signal.css";
type Entry = {
  turn: number;
  title: string;
  choice: string;
  result: string;
  saved: number;
  flag: string;
};
type State = {
  turn: number;
  power: number;
  trust: number;
  time: number;
  saved: number;
  flags: string[];
  log: Entry[];
  code: string;
  hard: boolean;
};
const store = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};
const fresh = (code = "NIGHT-01", hard = false): State => ({
  turn: 0,
  power: 100,
  trust: 64,
  time: 360,
  saved: 0,
  flags: [],
  log: [],
  code,
  hard,
});
function App() {
  const [state, setState] = useState<State>(() =>
    store("last-signal-run", fresh()),
  );
  const [panel, setPanel] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<Entry | null>(null);
  const [tune, setTune] = useState(98.6);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(() =>
    store(
      "last-signal-motion",
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  );
  const [captions, setCaptions] = useState(() =>
    store("last-signal-captions", true),
  );
  const [unlocked, setUnlocked] = useState(() =>
    store("last-signal-unlocked", false),
  );
  const audio = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [scenarioCode, setScenarioCode] = useState("");
  const finished = state.turn >= 8;
  const call = getCall(
    Math.min(state.turn, 7),
    state.flags,
    state.hard,
    state.trust,
  );
  const tuned = Math.abs(tune - 104.2) < 0.15;
  useEffect(() => {
    localStorage.setItem("last-signal-run", JSON.stringify(state));
    if (state.turn === 8) {
      setUnlocked(true);
      localStorage.setItem("last-signal-unlocked", "true");
    }
  }, [state]);
  useEffect(() => {
    localStorage.setItem("last-signal-motion", JSON.stringify(reduced));
  }, [reduced]);
  useEffect(() => {
    localStorage.setItem("last-signal-captions", JSON.stringify(captions));
  }, [captions]);
  useEffect(() => {
    if (panel) dialog.current?.showModal();
    else dialog.current?.close();
  }, [panel]);
  useEffect(
    () => () => {
      audio.current?.close();
    },
    [],
  );
  function toggleAudio() {
    if (!audio.current) {
      const a = new AudioContext();
      audio.current = a;
      const buffer = a.createBuffer(1, a.sampleRate * 3, a.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * 0.15;
      const noise = a.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = a.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 430;
      const g = a.createGain();
      g.gain.value = 0.24;
      noise.connect(filter);
      filter.connect(g);
      g.connect(a.destination);
      noise.start();
      gain.current = g;
    }
    audio.current.resume();
    gain.current!.gain.value = muted ? 0.24 : 0;
    setMuted(!muted);
  }
  function choose(choice: Choice) {
    if (
      result ||
      finished ||
      state.power + choice.power < 0 ||
      state.time < choice.time
    )
      return;
    const entry = {
      turn: state.turn + 1,
      title: call.title,
      choice: choice.label,
      result: choice.result,
      saved: choice.saved,
      flag: choice.flag,
    };
    setResult(entry);
    setState((s) => ({
      ...s,
      turn: s.turn + 1,
      power: Math.max(0, s.power + choice.power),
      trust: Math.max(0, Math.min(100, s.trust + choice.trust)),
      time: s.time - choice.time,
      saved: s.saved + choice.saved,
      flags: [...s.flags, choice.flag],
      log: [...s.log, entry],
    }));
  }
  function restart(code = "NIGHT-01", hard = false) {
    setState(fresh(code, hard));
    setResult(null);
    setTune(98.6);
    setPanel("");
  }
  const powered = state.flags.includes("hospital")
    ? ["hospital", "oldtown"]
    : state.flags.includes("station")
      ? ["station", "oldtown"]
      : ["hospital", "station", "oldtown"];
  const remaining = call.choices.some(
    (c) => state.power + c.power >= 0 && state.time >= c.time,
  );
  function conserve() {
    const entry = {
      turn: state.turn + 1,
      title: call.title,
      choice: "Keep listening",
      result:
        "Without enough power or time, the station can only listen. This rescue passes beyond your reach.",
      saved: 0,
      flag: "lost",
    };
    setResult(entry);
    setState((s) => ({
      ...s,
      turn: s.turn + 1,
      log: [...s.log, entry],
      trust: Math.max(0, s.trust - 8),
    }));
  }
  return (
    <div className={"app " + (reduced ? "reduced" : "")}>
      <header>
        <a className="brand" href="#" onClick={(e) => e.preventDefault()}>
          <Radio size={25} />
          <span>
            LAST SIGNAL<span className="brand-dot">.</span>
          </span>
        </a>
        <nav>
          <button
            className={!panel ? "active" : ""}
            onClick={() => setPanel("")}
          >
            The station
          </button>
          <button onClick={() => setPanel("files")}>
            Case files{" "}
            <span className="nav-count">
              {state.log.length.toString().padStart(2, "0")}
            </span>
          </button>
          <button onClick={() => setPanel("nights")}>
            Other nights <ArrowUpRight size={12} />
          </button>
        </nav>
        <div className="header-tools">
          <span className="live-dot" /> <span className="on-air">ON AIR</span>
          <i />
          <button
            className="icon-btn"
            aria-label={muted ? "Enable ambient sound" : "Mute sound"}
            onClick={toggleAudio}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            className="icon-btn"
            aria-label="Settings"
            onClick={() => setPanel("settings")}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>
      <main>
        <div className="night-heading">
          <div>
            <div className="eyebrow">
              <span /> A CITY ON THE EDGE OF SILENCE
            </div>
            <h1>Keep the light on.</h1>
            <p>Eight calls. One city. Every voice matters.</p>
          </div>
          <div className="night-tag">
            <span>SCENARIO {state.hard ? "02" : "01"}</span>
            <strong>{state.hard ? "The long rain" : "The last night"}</strong>
            <small>
              <span className="live-dot" /> LIVE TRANSMISSION
            </small>
          </div>
        </div>
        <div className="game-layout">
          <section className="city-panel">
            <div className="map-top">
              <span>
                <span className="live-dot" /> CITY OVERVIEW
              </span>
              <span>
                SECTOR 07 <i /> 23:
                {String(54 + Math.floor((360 - state.time) / 60)).padStart(
                  2,
                  "0",
                )}
              </span>
            </div>
            <City
              district={call.district}
              powered={powered}
              reduced={reduced}
              departed={state.flags.includes("station")}
            />
            <div className="city-vignette" />
            <div className="weather">
              12° <span>HEAVY RAIN</span>
              <small>Grid failure imminent</small>
            </div>
            <div
              className={
                "district hospital " +
                (powered.includes("hospital") ? "" : "offline")
              }
            >
              <span className="map-pin" />
              <div>
                ST. JUDE’S HOSPITAL
                <small>
                  {state.flags.includes("station")
                    ? "BACKUP OFFLINE"
                    : "CRITICAL POWER"}
                </small>
              </div>
            </div>
            <div className="district oldtown">
              <span className="map-pin" />
              <div>
                OLD TOWN
                <small>
                  {state.flags.includes("bridge")
                    ? "ROUTE RESTORED"
                    : "PARTIAL BLACKOUT"}
                </small>
              </div>
            </div>
            <div
              className={
                "district station " +
                (powered.includes("station") ? "" : "offline")
              }
            >
              <span className="map-pin" />
              <div>
                CENTRAL STATION
                <small>
                  {state.flags.includes("station")
                    ? "TRAIN DEPARTED"
                    : "EVACUATION POINT"}
                </small>
              </div>
            </div>
            <div className="map-bottom">
              <div className="map-legend">
                <span>
                  <b /> Power online
                </span>
                <span>
                  <b /> Signal lost
                </span>
              </div>
              <span className="coordinates">40°42′ N &nbsp; 74°00′ W</span>
            </div>
            <div className="city-caption">
              <span>THE CITY IS STILL LISTENING.</span>
              <small>{state.saved} people brought to safety</small>
            </div>
          </section>
          <section className="call-panel" aria-label="Current emergency call">
            <div className="call-top">
              <span>
                <span className="live-dot" />
                {finished
                  ? "TRANSMISSION ENDED"
                  : result
                    ? "SIGNAL RECEIVED"
                    : "INCOMING TRANSMISSION"}
              </span>
              <span>
                {String(Math.min(state.turn + (result ? 0 : 1), 8)).padStart(
                  2,
                  "0",
                )}{" "}
                / 08
              </span>
            </div>
            <div className="turn-track">
              {Array.from({ length: 8 }, (_, i) => (
                <span
                  key={i}
                  className={
                    i < state.turn
                      ? "complete"
                      : i === state.turn
                        ? "current"
                        : ""
                  }
                />
              ))}
            </div>
            {result ? (
              <div className="consequence">
                <div className="caller-icon">
                  <Check size={24} />
                </div>
                <div className="eyebrow">YOUR SIGNAL MADE A DIFFERENCE</div>
                <h2>{result.choice}</h2>
                <p>{result.result}</p>
                <div className="rescued">
                  <Users size={16} />{" "}
                  {result.saved > 0
                    ? `${result.saved} people reached safety`
                    : "The city will remember"}
                </div>
                <button className="primary" onClick={() => setResult(null)}>
                  {finished ? "See the aftermath" : "Answer the next call"}
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : finished ? (
              <div className="consequence">
                <div className="eyebrow">AFTERMATH · {state.code}</div>
                <h2>
                  {state.saved >= 150
                    ? "A city carries on."
                    : "There were lights in the dark."}
                </h2>
                <div className="ending-number">
                  {state.saved}
                  <span>people reached safety</span>
                </div>
                <p>
                  {state.flags.includes("hospital")
                    ? "Mara kept the hospital alive."
                    : "Mara stayed until the very end."}{" "}
                  {state.flags.includes("engineer")
                    ? "Eli remembers the voice that brought him home."
                    : "The maintenance frequency never returned."}{" "}
                  Your last signal became part of this city.
                </p>
                <button
                  className="primary"
                  onClick={() => setPanel("timeline")}
                >
                  Trace your decisions
                  <ArrowRight size={16} />
                </button>
                <button
                  className="text-button"
                  onClick={() => restart(state.code, state.hard)}
                >
                  <RotateCcw size={14} /> Try another way
                </button>
              </div>
            ) : (
              <>
                <div className="caller">
                  <div className="caller-icon">
                    <Radio size={24} />
                  </div>
                  <div>
                    <strong>{call.name}</strong>
                    <span>{call.role}</span>
                  </div>
                  <div className="wave-mini">▁▃▆▂▅▇▃▁</div>
                </div>
                <div className="call-body">
                  <div className="eyebrow">
                    {state.turn === 0
                      ? "THE FIRST CALL"
                      : `CALL ${String(state.turn + 1).padStart(2, "0")}`}
                  </div>
                  <h2>{call.title}</h2>
                  <p className="quote">“{call.message}”</p>
                  <span className="caption-label">
                    {captions
                      ? "[ Rain on the window. A voice waiting. ]"
                      : "Transmission transcript"}
                  </span>
                </div>
                <div className="choices">
                  <div className="decision-label">
                    YOUR CALL. THEIR CONSEQUENCE.
                  </div>
                  {call.choices.map((choice, i) => {
                    const disabled =
                      state.power + choice.power < 0 ||
                      state.time < choice.time ||
                      (state.turn === 2 && i === 0 && !tuned);
                    return (
                      <button
                        className="choice"
                        key={choice.flag}
                        disabled={disabled}
                        onClick={() => choose(choice)}
                      >
                        <span className="choice-number">0{i + 1}</span>
                        <span className="choice-copy">
                          <strong>{choice.label}</strong>
                          <small>
                            {disabled && state.turn === 2 && i === 0 && !tuned
                              ? "Tune the desk radio to 104.2 MHz"
                              : choice.detail}
                          </small>
                          <span className="cost">
                            {choice.power < 0 ? (
                              <>
                                <Zap size={10} />
                                {choice.power} POWER <i>·</i>
                              </>
                            ) : null}
                            <Clock size={10} /> {choice.time}s <i>·</i>{" "}
                            {choice.trust > 0 ? "+" : ""}
                            {choice.trust} TRUST
                          </span>
                        </span>
                        <ArrowUpRight size={18} />
                      </button>
                    );
                  })}
                  {!remaining && (
                    <button className="primary" onClick={conserve}>
                      Keep listening <ArrowRight size={16} />
                    </button>
                  )}
                  <p className="choice-note">
                    No perfect answers. Just the ones you can live with.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
        <section
          className="radio-desk"
          aria-label="Radio controls and city resources"
        >
          <div className="radio-id">
            <div className="radio-grille">
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <div>
              <Radio size={18} />
              <strong>FIELD RADIO</strong>
              <span>FR–08 / EMERGENCY BAND</span>
            </div>
          </div>
          <div className="tuner">
            <div className="tuner-header">
              <span>FREQUENCY</span>
              <strong>
                {tune.toFixed(1)} <small>MHz</small>
              </strong>
              <span className="signal-bars">▂▄▆█</span>
            </div>
            <input
              type="range"
              aria-label="Radio frequency"
              min="88"
              max="108"
              step="0.1"
              value={tune}
              onChange={(e) => setTune(+e.target.value)}
            />
            <div className="tuner-ticks">
              <span>88</span>
              <span>92</span>
              <span>96</span>
              <span>100</span>
              <span>104</span>
              <span>108</span>
            </div>
          </div>
          <div className="resource">
            <div>
              <Zap size={14} />
              <span>POWER</span>
            </div>
            <strong>
              {state.power}
              <small>%</small>
            </strong>
            <div className="resource-bar">
              <i style={{ width: state.power + "%" }} />
            </div>
          </div>
          <div className="resource">
            <div>
              <Clock size={14} />
              <span>TIME LEFT</span>
            </div>
            <strong>
              {Math.floor(state.time / 60)
                .toString()
                .padStart(2, "0")}
              <em>:</em>
              {(state.time % 60).toString().padStart(2, "0")}
            </strong>
            <small>UNTIL BLACKOUT</small>
          </div>
          <div className="resource trust">
            <div>
              <Users size={14} />
              <span>PUBLIC TRUST</span>
            </div>
            <strong>
              {state.trust}
              <small>%</small>
            </strong>
            <div className="resource-bar">
              <i style={{ width: state.trust + "%" }} />
            </div>
          </div>
        </section>
        <footer>
          <span>
            <Headphones size={13} /> Best experienced with sound{" "}
            <button onClick={toggleAudio}>
              {muted ? "Enable audio" : "Audio on"} <ArrowUpRight size={11} />
            </button>
          </span>
          <span>
            <span className="save-dot" /> Progress saved on this device <i />{" "}
            <button onClick={() => setPanel("timeline")}>
              Transmission log <ChevronRight size={12} />
            </button>
          </span>
        </footer>
      </main>
      <div className="bottom-line">
        <span>WHEN EVERYTHING GOES DARK, BE THE VOICE.</span>
        <span>
          LAST SIGNAL © 2026 <Activity size={13} />
        </span>
      </div>
      <dialog
        ref={dialog}
        onCancel={() => setPanel("")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPanel("");
        }}
      >
        {panel && (
          <div className="modal">
            <button
              className="close icon-btn"
              aria-label="Close panel"
              onClick={() => setPanel("")}
            >
              <X size={22} />
            </button>
            <div className="eyebrow">LAST SIGNAL / STATION ARCHIVE</div>
            <h2>
              {panel === "settings"
                ? "Your station."
                : panel === "files"
                  ? "Case files."
                  : panel === "nights"
                    ? "Other nights."
                    : "The choices that stayed."}
            </h2>
            {panel === "settings" ? (
              <>
                <div className="setting">
                  <span>Ambient radio & rain</span>
                  <button onClick={toggleAudio}>{muted ? "Off" : "On"}</button>
                </div>
                <div className="setting">
                  <span>Atmosphere captions</span>
                  <button
                    aria-pressed={captions}
                    onClick={() => setCaptions(!captions)}
                  >
                    {captions ? "On" : "Off"}
                  </button>
                </div>
                <div className="setting">
                  <span>Reduced motion</span>
                  <button
                    aria-pressed={reduced}
                    onClick={() => setReduced(!reduced)}
                  >
                    {reduced ? "On" : "Off"}
                  </button>
                </div>
                <p>Your choices save automatically in this browser.</p>
                <button
                  className="text-button"
                  onClick={() => setPanel("reset")}
                >
                  <RotateCcw size={14} /> Start this night again
                </button>
              </>
            ) : panel === "reset" ? (
              <>
                <p>
                  Restarting clears the current night’s decisions. Your unlocked
                  scenarios will stay available.
                </p>
                <button
                  className="primary"
                  onClick={() => restart(state.code, state.hard)}
                >
                  Restart the night
                  <RotateCcw size={15} />
                </button>
                <button
                  className="text-button"
                  onClick={() => setPanel("settings")}
                >
                  Keep my progress
                </button>
              </>
            ) : panel === "files" ? (
              <>
                <p>People, places, and signals discovered during your night.</p>
                {state.log.length === 0 ? (
                  <div className="archive-empty">
                    <FolderOpen />
                    <p>
                      The first call is waiting. Answer it to open your first
                      case.
                    </p>
                  </div>
                ) : (
                  state.log.map((e) => (
                    <article className="archive-entry" key={e.turn}>
                      <small>
                        FILE {String(e.turn).padStart(2, "0")} · {e.saved} SAFE
                      </small>
                      <h3>
                        {getCall(e.turn - 1, state.flags, state.hard).name}
                      </h3>
                      <p>{e.result}</p>
                    </article>
                  ))
                )}
              </>
            ) : panel === "nights" ? (
              <>
                <p>
                  One city. Different pressures. Each night has eight calls.
                </p>
                <button className="scenario" onClick={() => restart()}>
                  <span>01</span>
                  <div>
                    <strong>The last night</strong>
                    <small>Standard · 100% power · 6 minutes</small>
                  </div>
                  <ArrowRight size={18} />
                </button>
                <button
                  className="scenario"
                  disabled={!unlocked}
                  onClick={() => restart("LONG-RAIN", true)}
                >
                  <span>02</span>
                  <div>
                    <strong>The long rain</strong>
                    <small>
                      {unlocked
                        ? "Unlocked · higher power costs"
                        : "Complete a night to unlock"}
                    </small>
                  </div>
                  <ArrowRight size={18} />
                </button>
                <button
                  className="scenario"
                  onClick={() =>
                    restart(
                      "DAILY-" +
                        new Intl.DateTimeFormat("en-CA", {
                          timeZone: "Europe/Paris",
                        }).format(new Date()),
                      true,
                    )
                  }
                >
                  <span>↻</span>
                  <div>
                    <strong>Daily transmission</strong>
                    <small>The long rain · shared daily code</small>
                  </div>
                  <ArrowRight size={18} />
                </button>
                <label className="code-label">
                  PLAY A SHARED SCENARIO CODE
                  <input
                    placeholder="NIGHT-01 or LONG-RAIN"
                    value={scenarioCode}
                    onChange={(e) =>
                      setScenarioCode(e.target.value.toUpperCase())
                    }
                  />
                </label>
                <button
                  className="primary"
                  disabled={
                    !/^(NIGHT-01|LONG-RAIN|DAILY-\d{4}-\d{2}-\d{2})$/.test(
                      scenarioCode,
                    )
                  }
                  onClick={() =>
                    restart(scenarioCode, scenarioCode !== "NIGHT-01")
                  }
                >
                  Tune in
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <p>
                  {state.saved} people reached safety. {state.log.length} of 8
                  calls answered.
                </p>
                {!state.log.length && (
                  <p>Your timeline begins with the first decision.</p>
                )}
                {state.log.map((e) => (
                  <article className="archive-entry" key={e.turn}>
                    <small>
                      TRANSMISSION 0{e.turn} · +{e.saved} SAFE
                    </small>
                    <h3>{e.choice}</h3>
                    <p>{e.result}</p>
                  </article>
                ))}
                <button
                  className="primary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `LAST SIGNAL · ${state.code} · ${state.saved} saved. Play the same scenario: ${location.origin}`,
                      );
                      setNotice("Scenario code copied");
                    } catch {
                      setNotice(`Scenario code: ${state.code}`);
                    }
                  }}
                >
                  <Share2 size={15} /> Share this night
                </button>
                <p className="code-label">SCENARIO CODE: {state.code}</p>
              </>
            )}
          </div>
        )}
      </dialog>
      {notice && (
        <button className="toast" onClick={() => setNotice("")}>
          {notice} <X size={14} />
        </button>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
