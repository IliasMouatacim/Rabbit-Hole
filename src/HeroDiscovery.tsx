import { useState } from "react";
import { OceanExperiment } from "./Experiments";
import "./discovery.css";

export default function HeroDiscovery({
  onEnter,
}: {
  onEnter: (path: string) => void;
}) {
  const [guess, setGuess] = useState<string | null>(null);
  return (
    <section
      className="hero-discovery"
      aria-label="Try a question"
      data-lenis-prevent
    >
      <span className="discovery-eyebrow">
        YOUR FIRST RABBIT HOLE · ABOUT 5 MINUTES
      </span>
      <h2>Could life thrive without sunlight?</h2>
      {!guess ? (
        <>
          <p>Make a guess. See what’s down there.</p>
          <div className="hero-guesses">
            {[
              "Yes, using chemical energy",
              "No, everything needs sunlight",
              "Show me first",
            ].map((text) => (
              <button key={text} onClick={() => setGuess(text)}>
                {text}
                <span>↗</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="hero-reveal" role="status">
            {guess.startsWith("No")
              ? "There’s a surprising exception. "
              : "Yes—and here’s one way. "}
            At some hydrothermal vents, microbes use chemical energy to make
            organic matter, supporting a food web without sunlight reaching the
            habitat.
          </p>
          <OceanExperiment initialDepth={2800} />
          <a
            className="discovery-source"
            href="https://oceanexplorer.noaa.gov/facts/chemosynthesis.html"
            target="_blank"
            rel="noreferrer"
          >
            NOAA Ocean Exploration · Chemosynthesis ↗
          </a>
          <div className="hero-next">
            <button onClick={() => onEnter("0")}>
              Explore the deep ocean →
            </button>
            <button onClick={() => onEnter("00")}>
              Follow this toward alien life →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
