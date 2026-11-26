import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { projects, type Project } from "./projects";
import Artwork from "./Artwork";

const titles = [
  "Worker matching",
  "Speech assessment",
  "Approved actions",
  "Business intelligence",
];

/** Present the four case studies as a keyboard-accessible reel with timed cuts and manual transport. */
export function ProjectReel({ close }: { close: () => void }) {
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const dialog = useRef<HTMLDialogElement>(null),
    p = projects[index];
  useEffect(() => {
    const d = dialog.current!;
    const trigger = document.activeElement as HTMLElement;
    d.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d.close();
      document.body.style.overflow = old;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (index === 3) setPlaying(false);
      else setIndex(index + 1);
    }, 4200);
    return () => clearTimeout(t);
  }, [playing, index]);
  function step(n: number) {
    setPlaying(false);
    setIndex((index + n + 4) % 4);
  }
  return (
    <dialog
      ref={dialog}
      className="reel-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      aria-label="Project reel"
    >
      <div className="reel-top">
        <span>Rohith / Project reel</span>
        <button onClick={close} aria-label="Close reel">
          <X />
        </button>
      </div>
      <div
        className="reel-slide"
        key={p.id}
        style={{ "--accent": p.accent } as React.CSSProperties}
      >
        <img
          className="reel-capture"
          src={"/studio/" + p.id + ".webp"}
          alt={p.name + " interface"}
        />
        <div>
          <small>{titles[index]}</small>
          <h2>{p.name}</h2>
          <p>{p.intro}</p>
          <a href={"/projects/" + p.id + "/"}>
            Open case study <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
      <div className="reel-progress">
        {projects.map((q, i) => (
          <button
            key={q.id}
            aria-label={"Show " + q.name}
            aria-pressed={index === i}
            onClick={() => {
              setIndex(i);
              setPlaying(false);
            }}
          />
        ))}
      </div>
      <div className="reel-transport">
        <span>0{index + 1} / 04</span>
        <button onClick={() => step(-1)} aria-label="Previous project">
          <ChevronLeft />
        </button>
        <button
          onClick={() => {
            if (!playing && index === 3) setIndex(0);
            setPlaying(!playing);
          }}
          aria-label={playing ? "Pause reel" : "Play reel"}
        >
          {playing ? <Pause /> : <Play />}
        </button>
        <button onClick={() => step(1)} aria-label="Next project">
          <ChevronRight />
        </button>
      </div>
    </dialog>
  );
}

/** Drive the physical model and its editorial overlays from the same normalized scroll position. */
export function StudioHero() {
  const rail = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const [reel, R] = useState(false);
  useEffect(() => {
    const host = rail.current!,
      layer = stage.current!,
      surface = canvas.current!,
      motion = matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    let render: Awaited<
        ReturnType<(typeof import("./workbenchScene"))["mountWorkbench"]>
      >,
      raf = 0,
      px = 0,
      py = 0,
      spin = 0,
      dragX: number | null = null,
      visible = true;
    function paint() {
      raf = 0;
      const progress = Math.min(
        1,
        Math.max(
          0,
          -host.getBoundingClientRect().top /
            Math.max(1, host.clientHeight - layer.clientHeight),
        ),
      );
      const first = Math.max(0, 1 - progress * 3.8),
        second = Math.min(1, Math.max(0, (progress - 0.52) * 4.4));
      layer.style.setProperty("--pose", String(progress));
      const travel = Math.min(1, Math.max(0, (progress - 0.06) / 0.17)),
        exit = Math.min(1, Math.max(0, (progress - 0.31) / 0.22));
      layer.style.setProperty("--mug-x", (1 - travel) * 28 + exit * 52 + "vw");
      layer.style.setProperty("--mug-y", (-1 + travel) * 26 - exit * 51 + "vh");
      layer.style.setProperty("--mug-alpha", String(1 - exit));
      layer.style.setProperty("--intro-opacity", String(first));
      layer.style.setProperty("--second-opacity", String(second));
      layer.style.setProperty(
        "--title-shift",
        (motion.matches ? 0 : -progress * 85) + "px",
      );
      layer.style.setProperty(
        "--desk-fade",
        String(Math.max(0, 1 - progress * 1.9)),
      );
      layer.dataset.phase = progress > 0.4 ? "studio" : "bench";
      const opening = layer.querySelector<HTMLElement>(".opening-content")!;
      opening.inert = first < 0.12;
      if (visible)
        render?.({
          progress,
          x: motion.matches ? 0 : px,
          y: motion.matches ? 0 : py,
          spin: motion.matches ? 0 : spin,
        });
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(paint);
    }
    function move(e: PointerEvent) {
      px = (e.clientX / innerWidth - 0.5) * 2;
      py = -(e.clientY / innerHeight - 0.5) * 2;
      if (dragX !== null) {
        spin += (e.clientX - dragX) * 0.009;
        dragX = e.clientX;
      }
      schedule();
    }
    const onDown = (e: PointerEvent) => {
      dragX = e.clientX;
      surface.setPointerCapture(e.pointerId);
    };
    const onUp = () => {
      dragX = null;
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(layer);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) schedule();
    });
    io.observe(layer);
    window.addEventListener("scroll", schedule, { passive: true });
    layer.addEventListener("pointermove", move);
    surface.addEventListener("pointerdown", onDown);
    surface.addEventListener("pointerup", onUp);
    surface.addEventListener("pointercancel", onUp);
    const fail = () => layer.classList.remove("has-model");
    surface.addEventListener("webglcontextlost", fail);
    import("./workbenchScene")
      .then((m) => {
        if (!controller.signal.aborted)
          return m.mountWorkbench(surface, controller.signal);
      })
      .then((result) => {
        if (result && !controller.signal.aborted) {
          render = result;
          paint();
          layer.classList.add("has-model");
        }
      })
      .catch(fail);
    motion.addEventListener("change", schedule);
    paint();
    return () => {
      controller.abort();
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      layer.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerdown", onDown);
      surface.removeEventListener("pointerup", onUp);
      surface.removeEventListener("pointercancel", onUp);
      surface.removeEventListener("webglcontextlost", fail);
      motion.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <section ref={rail} className="studio-rail" aria-label="Introduction">
      <div className="studio-stage" ref={stage}>
        <div className="poster-desk" />
        <div className="poster-board">
          <img src="/studio/processor.webp" alt="" />
        </div>
        <div className="bench-cup-poster" aria-hidden="true" />
        <canvas ref={canvas} className="studio-canvas" aria-hidden="true" />
        <div className="scene-shade" />
        <div className="calibrate" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="opening-content">
          <div className="studio-title">
            <p>Full-stack developer. AI/ML engineer.</p>
            <h1 aria-label="Rohith Kumar Dhamagatla">ROHITH</h1>
          </div>
          <div className="bio-glass">
            <strong>
              Rohith Kumar
              <br />
              Dhamagatla.
              <br />
              Engineer of
              <br />
              intelligent systems.
            </strong>
            <p>Speech, agents and real-time software. Built in India.</p>
            <a href="/Rohith-Kumar-Dhamagatla.pdf">
              View résumé <ArrowUpRight size={14} />
            </a>
          </div>
          <button className="open-reel" onClick={() => R(true)}>
            <span className="reel-thumb">
              <img src="/studio/processor.webp" alt="" />
              <Play size={19} fill="currentColor" />
            </span>
            <span>Play project reel</span>
          </button>
        </div>
        <div className="second-content">
          <div>
            <small>System breakdown</small>
            <h2>
              Inside
              <br />
              the build.
            </h2>
          </div>
          <p>Follow a signal from the interface to the decision behind it.</p>
        </div>
        <a className="scroll-cue" href="#internships">
          <span>
            <ArrowDown size={12} />
          </span>
          Scroll to explore
        </a>
      </div>
      {reel && <ProjectReel close={() => R(false)} />}
    </section>
  );
}

/** Flip between a sample input and its actual destination in the selected project's workflow. */
export function SignalLab() {
  const [project, setProject] = useState(0),
    [flipped, flip] = useState(false),
    [message, setMessage] = useState("");
  const p = projects[project],
    flow = p.flows[0][1],
    first = p.nodes[flow[0]],
    last = p.nodes[flow[flow.length - 1]];
  return (
    <section className="signal-lab section">
      <div>
        <div className="kicker">Workflow experiment</div>
        <h2>
          Flip the
          <br />
          signal.
        </h2>
        <p>
          Write a sample input. Flip the board to see where this workflow
          delivers its result.
        </p>
        <label>
          Project
          <select
            value={project}
            onChange={(e) => {
              setProject(+e.target.value);
              flip(false);
              setMessage("");
            }}
          >
            {projects.map((q, i) => (
              <option key={q.id} value={i}>
                {q.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sample input
          <input
            value={message}
            maxLength={90}
            placeholder={first[4]}
            onChange={(e) => {
              setMessage(e.target.value);
              flip(false);
            }}
          />
        </label>
        <button className="lab-flip" onClick={() => flip(!flipped)}>
          <RotateCcw size={16} />
          {flipped ? "Show input" : "Flip to output"}
        </button>
      </div>
      <div className={"signal-token " + (flipped ? "flipped" : "")}>
        <div className="token-face">
          <small>{p.name} / input</small>
          <strong>{first[0]}</strong>
          <p>{message || first[4]}</p>
        </div>
        <div className="token-face back">
          <small>{p.name} / output</small>
          <strong>{last[0]}</strong>
          <p>{last[5]}</p>
        </div>
      </div>
      <span className="sr-only" role="status">
        {flipped ? last[5] : first[4]}
      </span>
    </section>
  );
}

/** Use a single product selector for the featured project readings and live architecture links. */
export function WorkShowcase() {
  const [selected, setSelected] = useState(0),
    p = projects[selected];
  return (
    <section className="work-show section" id="work">
      <div className="kicker">Featured projects</div>
      <h2>Choose a system.</h2>
      <div className="show-tabs" aria-label="Featured projects">
        {projects.map((q, i) => (
          <button
            key={q.id}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            {q.name}
          </button>
        ))}
      </div>
      <div className="show-product" key={p.id}>
        <div
          className="show-art"
          style={{ "--accent": p.accent } as React.CSSProperties}
        >
          <Artwork p={p} />
          <span>{p.kind}</span>
        </div>
        <div className="show-copy">
          <small>0{selected + 1} / 04</small>
          <h3>{p.name}</h3>
          <p>{p.intro}</p>
          <span>{p.stack.slice(0, 4).join(" · ")}</span>
          <a className="primary" href={"/projects/" + p.id + "/"}>
            Explore project <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Render the case introduction as a full-bleed project poster, keeping its demo and source directly accessible. */
export function CasePoster({ p }: { p: Project }) {
  return (
    <div
      className="case-poster"
      style={{ "--accent": p.accent } as React.CSSProperties}
    >
      <div className="case-visual">
        <img src={"/studio/" + p.id + ".webp"} alt={p.name + " interface"} />
      </div>
      <div className="case-caption">
        <a href="/#work">← Selected work</a>
        <div className="kicker">{p.kind}</div>
        <h1>{p.name}</h1>
        <p>{p.intro}</p>
        <div className="actions">
          <a className="primary" href={p.link}>
            {p.linkLabel} <ArrowUpRight size={16} />
          </a>
          <a
            className="secondary"
            href={"https://github.com/9059Rohith/" + p.repo}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </div>
  );
}
