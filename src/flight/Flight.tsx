import { useEffect, useRef, useState } from "react";
import { projects, github } from "../projects";
import { contribution, linkedin, mail, paper, resume, stops } from "./stops";
import { createAmbience } from "./audio";
import "@fontsource-variable/bodoni-moda/standard.css";
import "@fontsource-variable/dm-sans/wght.css";
import "./flight.css";

const last = stops.length - 1;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const selected = () => stops.findIndex((s) => s.id === location.hash.slice(1));
const stopHeight = () =>
  Math.max(580, document.documentElement.clientHeight) * 1.24;
type Sheet = "about" | "index" | string | null;

/** Tie native scrolling, direct chapter links, keyboard entry and audio to one flight position. */
export default function Flight() {
  const [entered, enter] = useState(selected() >= 0),
    [index, setIndex] = useState(Math.max(0, selected()));
  const [sheet, setSheet] = useState<Sheet>(null),
    [sound, setSound] = useState(false),
    [ready, setReady] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    view = useRef<HTMLDivElement>(null),
    dial = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    aboutBtn = useRef<HTMLButtonElement>(null),
    explore = useRef<HTMLButtonElement>(null);
  const progress = useRef(Math.max(0, selected())),
    jumpAfterEntry = useRef(Math.max(0, selected())),
    aud = useRef<ReturnType<typeof createAmbience> | null>(null),
    audioOn = useRef(false);
  const cur = stops[index],
    isDiagram = sheet !== null && sheet !== "about" && sheet !== "index";
  /** Move the actual scrollbar so browser history, touch, mouse and keyboard agree on the current stop. */
  function jump(to: number) {
    const s = clamp(to, 0, last);
    jumpAfterEntry.current = s;
    if (!entered) {
      enter(true);
      return;
    }
    window.scrollTo({ top: s * stopHeight(), behavior: "instant" });
  }
  function go(to: number) {
    setSheet(null);
    jump(to);
  }
  async function toggleSound(enable: boolean) {
    audioOn.current = enable;
    try {
      if (enable) {
        aud.current ??= createAmbience();
        await aud.current.play();
        if (!audioOn.current) aud.current.mute();
      } else aud.current?.mute();
      setSound(audioOn.current);
    } catch {
      audioOn.current = false;
      setSound(false);
    }
  }
  function start() {
    jumpAfterEntry.current = 0;
    enter(true);
    void toggleSound(true);
  }
  function replay() {
    setSheet(null);
    jump(0);
    enter(false);
    setIndex(0);
    setReady(false);
    history.replaceState(null, "", location.pathname);
    void toggleSound(false);
    requestAnimationFrame(() => explore.current?.focus());
  }
  useEffect(
    () => () => {
      aud.current?.dispose();
    },
    [],
  );
  useEffect(() => {
    if (!entered) {
      function departAtHash() {
        const target = selected();
        if (target >= 0) {
          jumpAfterEntry.current = target;
          setIndex(target);
          enter(true);
        }
      }
      window.addEventListener("hashchange", departAtHash);
      return () => window.removeEventListener("hashchange", departAtHash);
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
      root = document.documentElement;
    let raf = 0,
      destroyed = false,
      world: ReturnType<typeof import("./world").flightWorld> | undefined,
      dirty = true,
      suspended = false,
      previousFrame = 0;
    const ref = canvas.current!;
    function measure() {
      const value = clamp(scrollY / stopHeight(), 0, last),
        i = Math.round(value),
        offset = value - i;
      progress.current = value;
      setIndex(i);
      aud.current?.travel(value);
      const opacity = reduced.matches
        ? 1
        : clamp((0.52 - Math.abs(offset)) / 0.16, 0, 1);
      view.current?.style.setProperty("--copy-alpha", String(opacity));
      view.current?.style.setProperty(
        "--approach",
        String(
          reduced.matches
            ? 1
            : offset < 0
              ? 1 + offset * 1.05
              : 1 + offset * 0.92,
        ),
      );
      view.current?.style.setProperty(
        "--pass-x",
        (reduced.matches ? 0 : offset * (i % 2 === 0 ? -1 : 1) * 23) + "vw",
      );
      view.current?.style.setProperty(
        "--lift",
        (reduced.matches ? 0 : -offset * 58) + "px",
      );
      view.current?.style.setProperty("--route", String(value / last));
      if (dial.current) dial.current.value = String(value);
      dirty = true;
      schedule();
    }
    function draw(time: number) {
      raf = 0;
      if (destroyed || document.hidden || suspended) return;
      if (
        world &&
        (dirty || (!reduced.matches && time - previousFrame >= 32))
      ) {
        previousFrame = time;
        world.draw(progress.current, time, reduced.matches);
        dirty = false;
      }
      if (world && !reduced.matches) schedule();
    }
    function schedule() {
      if (!raf && !destroyed && !suspended && !document.hidden)
        raf = requestAnimationFrame(draw);
    }
    function resize() {
      const old = progress.current;
      root.style.setProperty("--flight-length", last * stopHeight() + "px");
      window.scrollTo({ top: old * stopHeight(), behavior: "instant" });
      measure();
    }
    function hash() {
      const i = selected();
      if (i >= 0) jump(i);
    }
    function suspend() {
      suspended = !!dialog.current?.open;
      if (!suspended) {
        dirty = true;
        schedule();
      }
    }
    function lost(event: Event) {
      event.preventDefault();
      world?.dispose();
      world = undefined;
      setReady(false);
    }
    const modal = dialog.current!,
      changes = new MutationObserver(suspend);
    changes.observe(modal, { attributes: true, attributeFilter: ["open"] });
    root.style.setProperty("--flight-length", last * stopHeight() + "px");
    window.scrollTo({
      top: jumpAfterEntry.current * stopHeight(),
      behavior: "instant",
    });
    measure();
    aboutBtn.current?.focus({ preventScroll: true });
    import("./world")
      .then((module) => {
        if (destroyed) return;
        try {
          world = module.flightWorld(ref, stops.length);
          world.draw(progress.current, 0, reduced.matches);
          setReady(true);
          schedule();
        } catch {
          setReady(false);
        }
      })
      .catch(() => setReady(false));
    ref.addEventListener("webglcontextlost", lost);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("hashchange", hash);
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", measure);
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ref.removeEventListener("webglcontextlost", lost);
      world?.dispose();
      changes.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", resize);
      window.removeEventListener("hashchange", hash);
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", measure);
    };
  }, [entered]);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (sheet) {
      if (!d.open) d.showModal();
      document.documentElement.classList.add("flight-dialog-open");
      d.querySelector(".sheet-scroll")?.scrollTo(0, 0);
    } else {
      if (d.open) d.close();
      document.documentElement.classList.remove("flight-dialog-open");
    }
    return () =>
      document.documentElement.classList.remove("flight-dialog-open");
  }, [sheet]);
  function openAtlas() {
    setSheet(cur.project?.id ?? "all");
  }
  return (
    <div className={entered ? "flight journey" : "flight gate"} ref={view}>
      <div className="flight-view" aria-hidden="true">
        <div className="sky" />
        {entered && (
          <>
            <div className={"flight-poster " + (ready ? "hidden" : "")} />
            <canvas className={ready ? "world online" : "world"} ref={canvas} />
          </>
        )}
      </div>
      {!entered ? (
        <main className="departure">
          <div className="departure-name">
            <h1 aria-label="Rohith">
              {[..."ROHITH"].map((c, i) => (
                <span key={i} style={{ animationDelay: (5 - i) * 0.065 + "s" }}>
                  {c}
                </span>
              ))}
            </h1>
            <svg className="seal" viewBox="0 0 150 150" aria-hidden="true">
              <defs>
                <path
                  id="ring"
                  d="M75 75m-59 0a59 59 0 1 1 118 0a59 59 0 1 1-118 0"
                />
              </defs>
              <text>
                <textPath href="#ring" textLength="368">
                  AI ENGINEERING · FULL-STACK DEVELOPMENT ·{" "}
                </textPath>
              </text>
            </svg>
          </div>
          <button ref={explore} className="pill explore" onClick={start}>
            Explore
          </button>
        </main>
      ) : (
        <>
          <div className="flight-track" aria-hidden="true" />
          <header className="hud">
            <button
              className={"sound " + (sound ? "playing" : "")}
              aria-label={sound ? "Mute flight audio" : "Enable flight audio"}
              aria-pressed={sound}
              onClick={() => void toggleSound(!sound)}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    animationDelay: -i * 0.19 + "s",
                    height: 6 + Math.sin(i * 0.58) ** 2 * 13 + "px",
                  }}
                />
              ))}
            </button>
            <button
              className="wordmark"
              aria-label="Open flight index"
              onClick={() => setSheet("index")}
            >
              ROHITH
            </button>
            <button
              className="about-btn"
              ref={aboutBtn}
              onClick={() => setSheet("about")}
            >
              About
            </button>
          </header>
          <label className="progress-rail">
            <span />
            <input
              aria-label="Flight position"
              ref={dial}
              type="range"
              min="0"
              max={last}
              step=".01"
              defaultValue={progress.current}
              onChange={(e) =>
                window.scrollTo({
                  top: Number(e.target.value) * stopHeight(),
                  behavior: "instant",
                })
              }
            />
          </label>
          <main className="flight-main">
            {index === 0 ? (
              <div className="scroll-hint">
                <button onClick={() => jump(1)}>
                  Scroll to explore my work
                </button>
              </div>
            ) : index === last ? (
              <section key="arrival" className="arrival">
                <h2>{cur.body}</h2>
                <div className="arrival-links">
                  {cur.links?.map(([label, url]) => (
                    <a key={url} href={url}>
                      {label} ↗
                    </a>
                  ))}
                </div>
                <button className="pill" onClick={replay}>
                  Replay
                </button>
              </section>
            ) : (
              <section
                key={cur.id}
                className={
                  "flight-story " + (index % 2 === 0 ? "port" : "starboard")
                }
                aria-labelledby="story-title"
              >
                <small>
                  {cur.group}
                  {cur.project ? " / " + cur.project.kind : ""}
                </small>
                <h2 id="story-title">{cur.title}</h2>
                <p>{cur.body}</p>
                <div className="story-links">
                  {cur.project && (
                    <>
                      <button onClick={openAtlas}>Architecture ↗</button>
                      <a
                        href={cur.project.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {cur.project.id === "udhyogapay"
                          ? "Matching demo"
                          : "Live demo"}{" "}
                        ↗
                      </a>
                      <a
                        href={github + "/" + cur.project.repo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Code ↗
                      </a>
                    </>
                  )}
                  {cur.id === "architecture" && (
                    <button onClick={openAtlas}>Explore architecture ↗</button>
                  )}
                  {cur.links?.map(([label, url]) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      {label} ↗
                    </a>
                  ))}
                </div>
              </section>
            )}
          </main>
          {index > 0 && index < last && (
            <nav className="chapter-nav" aria-label="Chapter navigation">
              <button
                aria-label="Previous chapter"
                onClick={() => jump(index - 1)}
              >
                ←
              </button>
              <button onClick={() => setSheet("index")}>
                {String(index).padStart(2, "0")} /{" "}
                {String(last).padStart(2, "0")}
              </button>
              <button aria-label="Next chapter" onClick={() => jump(index + 1)}>
                →
              </button>
            </nav>
          )}
        </>
      )}
      <dialog
        ref={dialog}
        className={isDiagram ? "flight-sheet diagram" : "flight-sheet"}
        aria-label={
          isDiagram
            ? "Interactive architecture"
            : sheet === "index"
              ? "Flight index"
              : "About Rohith"
        }
        onCancel={() => setSheet(null)}
        onClose={() => setSheet(null)}
      >
        {!isDiagram && sheet && (
          <div className="sheet-mast">
            <button
              aria-label={sound ? "Mute flight audio" : "Enable flight audio"}
              onClick={() => void toggleSound(!sound)}
              className={"sound " + (sound ? "playing" : "")}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height: 6 + Math.sin(i * 0.58) ** 2 * 13 + "px",
                    animationDelay: -i * 0.19 + "s",
                  }}
                />
              ))}
            </button>
            <span>ROHITH</span>
          </div>
        )}
        <button
          className="close-sheet"
          onClick={() => setSheet(null)}
          aria-label="Close panel"
        >
          ×
        </button>
        {sheet && (
          <div className="sheet-scroll">
            {isDiagram ? (
              <iframe
                key={sheet}
                src={"/flight/?diagram=" + encodeURIComponent(sheet!)}
                title="Interactive system architecture"
              />
            ) : (
              <>
                <h2>{sheet === "index" ? "Flight index" : "About Rohith"}</h2>
                {sheet === "about" && (
                  <>
                    <p>
                      I’m Rohith Kumar Dhamagatla, an AI/ML and full-stack
                      engineer from Anantapur, India. I build speech tools,
                      worker marketplaces and software that can act with a
                      person’s approval.
                    </p>
                    <div className="sheet-links">
                      <a href={resume}>Résumé ↗</a>
                      <a href={github}>GitHub ↗</a>
                      <a href={linkedin}>LinkedIn ↗</a>
                      <a href={mail}>Email ↗</a>
                    </div>
                  </>
                )}
                <h3>Flight plan</h3>
                <div className="flight-index">
                  {stops.map((s, i) => (
                    <button onClick={() => go(i)} key={s.id}>
                      <small>
                        {String(i + 1).padStart(2, "0")} / {s.group}
                      </small>
                      <span>{s.title}</span>
                    </button>
                  ))}
                </div>
                {sheet === "about" && (
                  <>
                    <h3>References</h3>
                    <div className="references">
                      {projects.map((p) => (
                        <a key={p.id} href={"/projects/" + p.id + "/"}>
                          {p.name} case study ↗
                        </a>
                      ))}
                      <a href={paper}>IEEE research publication ↗</a>
                      <a href={contribution}>Open-source contribution ↗</a>
                      <a href="/#capabilities">Technical skills ↗</a>
                      <a href="/#contact">Portfolio and contact ↗</a>
                    </div>
                    <h3>Achievements</h3>
                    <p>
                      TCS CodeVita finalist · Google PromptWars national top
                      eight · Amazon ML Summer School · Google Student
                      Ambassador.
                    </p>
                    <p className="credits">
                      Flight concept inspired by{" "}
                      <a href="https://atmos.leeroy.ca/">Atmos by LEEROY</a>.
                      Original flight scene and synthesized audio for this
                      portfolio.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
