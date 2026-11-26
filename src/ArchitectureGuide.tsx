import { ScrollBackdrop } from "./ScrollBackdrop";
import { useSequenceClock } from "./useSequenceClock";
import SystemTopology from "./SystemTopology";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Database,
  Layers,
  Maximize,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Users,
} from "lucide-react";
import { projects, github, type Project } from "./projects";
import { designs, type Pathway, type Stage } from "./atlasData";

function readLocation(initial?: Project) {
  const params = new URLSearchParams(window.location.search);
  const project =
    initial ??
    projects.find((p) => p.id === params.get("system")) ??
    projects[0];
  const number = Number(params.get("flow") || 0);
  const flow =
    Number.isInteger(number) &&
    number >= 1 &&
    number <= designs[project.id].flows.length
      ? number - 1
      : -1;
  return { project, flow, step: 0 };
}

/** Show each subsystem as a separate, ordered path. Repeated components are shared boundaries between paths. */
function Overview({
  flows,
  onOpen,
  onPlay,
}: {
  flows: Pathway[];
  onOpen: (flow: number, step: number) => void;
  onPlay: (flow: number) => void;
}) {
  return (
    <div className="system-map" aria-label="System overview diagram">
      <ScrollBackdrop motif="lattice" tone="paper" reverse />
      {flows.map((f, i) => (
        <article key={f.name} className="map-lane">
          <div className="lane-head">
            <div>
              <small>Workflow {String(i + 1).padStart(2, "0")}</small>
              <h4>{f.name}</h4>
            </div>
            <button onClick={() => onPlay(i)}>
              <Play size={15} /> Play workflow
            </button>
          </div>
          <p>{f.question}</p>
          <ol className="lane-stages">
            {f.steps.map(([component, action], j) => (
              <li key={j}>
                <button onClick={() => onOpen(i, j)}>
                  <span>{component}</span>
                  <strong>{action}</strong>
                </button>
                {j < f.steps.length - 1 && (
                  <ArrowRight aria-hidden="true" size={15} />
                )}
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}

/** Allow a zoomed sequence to be explored with pointer dragging or native scrolling. */
function DiagramViewport({
  children,
  scale,
}: {
  children: React.ReactNode;
  scale: number;
}) {
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  return (
    <div
      className="trace-viewport"
      tabIndex={0}
      role="region"
      aria-label="Scrollable workflow diagram"
      onPointerDown={(e) => {
        if (
          scale <= 1 ||
          e.pointerType !== "mouse" ||
          (e.target as Element).closest("button")
        )
          return;
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          left: e.currentTarget.scrollLeft,
          top: e.currentTarget.scrollTop,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d)
          e.currentTarget.scrollTo(
            d.left + d.x - e.clientX,
            d.top + d.y - e.clientY,
          );
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <div style={{ zoom: scale }}>{children}</div>
    </div>
  );
}

function SourceLink({ project, stage }: { project: Project; stage: Stage }) {
  const path = stage[4],
    line = stage[5];
  return (
    <a
      className="evidence-link"
      href={
        github +
        "/" +
        project.repo +
        "/blob/" +
        designs[project.id].revision +
        "/" +
        path +
        "#L" +
        line
      }
    >
      <BookOpen size={15} />
      <code>
        {path}:{line}
      </code>
      <ArrowUpRight size={14} />
    </a>
  );
}

/** Keep the active system, workflow and selected step in sync across the diagram, evidence and playback controls. */
export default function ArchitectureGuide({ initial }: { initial?: Project }) {
  const [view, setView] = useState(() => readLocation(initial)),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1),
    [zoom, setZoom] = useState(1);
  const workspace = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0),
    [finished, setFinished] = useState(false);
  const { project, flow, step } = view,
    design = designs[project.id],
    path = design.flows[flow],
    stage = path?.steps[step];
  useEffect(() => {
    const viewport =
      workspace.current?.querySelector<HTMLElement>(".trace-viewport");
    const node = viewport?.querySelector<HTMLElement>(
      ".trace-node[aria-pressed=true]",
    );
    if (!viewport || !node) return;
    const area = viewport.getBoundingClientRect(),
      item = node.getBoundingClientRect();
    if (item.top < area.top || item.bottom > area.bottom)
      viewport.scrollBy({ top: item.top - area.top - 12, behavior: "instant" });
  }, [project.id, flow, step, zoom]);
  const rewind = useSequenceClock(
    project.id + "/" + flow + "/" + step,
    playing,
    6500,
    speed,
    (fraction) => {
      meter.current?.style.setProperty("--elapsed", String(fraction));
      workspace.current?.style.setProperty(
        "--wire-progress",
        String(Math.max(0, (fraction - 0.69) / 0.31)),
      );
      const progress = fraction < 0.29 ? 0 : fraction < 0.69 ? 1 : 2;
      setPhase((old) => (old === progress ? old : progress));
    },
    () => {
      if (!path || step === path.steps.length - 1) {
        setPlaying(false);
        setFinished(true);
        return;
      }
      setView((v) => ({ ...v, step: v.step + 1 }));
    },
  );
  function chooseFlow(f: number, s = 0, p = project, reveal = false) {
    setPlaying(false);
    setFinished(false);
    rewind();
    setZoom(1);
    setView({ project: p, flow: f, step: s });
    const u = new URL(window.location.href);
    u.searchParams.set("system", p.id);
    if (f >= 0) u.searchParams.set("flow", String(f + 1));
    else u.searchParams.delete("flow");
    u.hash = "architecture";
    history.replaceState(history.state, "", u);
    if (reveal)
      requestAnimationFrame(() =>
        workspace.current?.scrollIntoView({
          behavior: "instant",
          block: "start",
        }),
      );
  }
  function chooseStep(s: number) {
    setPlaying(false);
    setFinished(false);
    rewind();
    setView((v) => ({ ...v, step: s }));
  }
  return (
    <section className="section atlas" id="architecture">
      <ScrollBackdrop motif="circuit" tone="paper" />
      <div className="atlas-heading">
        <div>
          <div className="kicker">System design</div>
          <h2>Complete Architecture</h2>
        </div>
        <p>
          Play the system map to see which components talk to each other. Then
          play a request to follow its data, decisions and result through the
          code.
        </p>
      </div>
      {!initial && (
        <div className="system-picker" aria-label="Architecture project">
          {projects.map((p) => (
            <button
              key={p.id}
              aria-pressed={p.id === project.id}
              onClick={() => chooseFlow(-1, 0, p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
      <div
        className="atlas-sheet"
        style={{ "--system-color": project.accent } as React.CSSProperties}
      >
        <div className="system-brief">
          <ScrollBackdrop motif="circuit" tone="olive" />
          <small>{project.kind}</small>
          <h3>{project.name}</h3>
          <p>{design.summary}</p>
          <button
            className="launch-request"
            onClick={() => {
              chooseFlow(flow < 0 ? 0 : flow, 0, project, true);
              setPlaying(true);
            }}
          >
            <Play size={16} fill="currentColor" /> Play a request
          </button>
        </div>
        <dl className="boundaries">
          {[
            [Users, "People", design.people],
            [CircuitBoard, "Application boundary", design.boundary],
            [Database, "Stored state", design.storage],
          ].map(([Icon, label, body]) => {
            const I = Icon as typeof Users;
            return (
              <div key={String(label)}>
                <dt>
                  <I size={16} />
                  {String(label)}
                </dt>
                <dd>{String(body)}</dd>
              </div>
            );
          })}
        </dl>
        <div ref={workspace} className="atlas-workspace">
          <div className="map-toolbar">
            <strong>
              <Layers size={17} />
              {path ? "Request walkthrough" : "System overview"}
            </strong>
            <label>
              View{" "}
              <select
                aria-label="Architecture view"
                value={flow}
                onChange={(e) => chooseFlow(Number(e.target.value))}
              >
                <option value={-1}>Complete system</option>
                {design.flows.map((f, i) => (
                  <option key={f.name} value={i}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!path ? (
            <>
              <SystemTopology
                key={project.id}
                id={project.id}
                onTrace={(f, s) => chooseFlow(f, s, project, true)}
              />
              <Overview
                flows={design.flows}
                onOpen={(f, s) => chooseFlow(f, s, project, true)}
                onPlay={(f) => {
                  chooseFlow(f, 0, project, true);
                  setPlaying(true);
                }}
              />
            </>
          ) : (
            <>
              <div className="walk-intro">
                <ScrollBackdrop motif="orbit" tone="paper" />
                <button
                  className="back-to-map"
                  onClick={() => chooseFlow(-1, 0, project, true)}
                >
                  <ChevronLeft size={14} /> System overview
                </button>
                <h4>{path.question}</h4>
                <p>
                  <b>Example request</b> {path.input}
                </p>
              </div>
              <div
                className="request-player"
                ref={meter}
                data-phase={phase}
                data-playing={playing}
                data-finished={finished}
              >
                <ScrollBackdrop motif="ribbon" tone="olive" />
                <div className="player-head">
                  <span>Request playback</span>
                  <b>
                    {finished
                      ? "Complete"
                      : `Step ${step + 1} / ${path.steps.length}`}
                  </b>
                </div>
                <div
                  className="transport-diagram"
                  aria-label="Input, active component and output"
                >
                  <span className="transport-stop incoming">
                    <small>From</small>
                    {step ? path.steps[step - 1][0] : "Example request"}
                  </span>
                  <i className="transport-track in-track">
                    <b />
                  </i>
                  <strong className="transport-stop processing">
                    {stage[0]}
                  </strong>
                  <i className="transport-track out-track">
                    <b />
                  </i>
                  <span className="transport-stop outgoing">
                    <small>To</small>
                    {step < path.steps.length - 1
                      ? path.steps[step + 1][0]
                      : "Request result"}
                  </span>
                </div>
                <div className="player-caption" aria-live="polite">
                  <small>
                    {finished
                      ? "Result"
                      : ["Receiving", "Processing", "Passing on"][phase]}
                  </small>
                  <p>
                    {finished
                      ? path.result
                      : phase === 0
                        ? step
                          ? path.steps[step - 1][3]
                          : path.input
                        : phase === 1
                          ? stage[2]
                          : stage[3]}
                  </p>
                </div>
                <div className="chapter-bars" aria-label="Workflow steps">
                  {path.steps.map((item, i) => (
                    <button
                      key={i}
                      aria-label={"Jump to " + item[1]}
                      aria-current={step === i ? "step" : undefined}
                      className={
                        i < step || finished
                          ? "done"
                          : i === step
                            ? "current"
                            : ""
                      }
                      onClick={() => chooseStep(i)}
                    >
                      <i />
                    </button>
                  ))}
                </div>
                <div className="trace-tools">
                  <button
                    onClick={() => {
                      if (!playing && finished) chooseStep(0);
                      setPlaying(!playing);
                    }}
                  >
                    {playing ? <Pause /> : <Play />}
                    {playing
                      ? "Pause"
                      : finished
                        ? "Replay trace"
                        : "Play trace"}
                  </button>
                  <button
                    aria-label="Previous step"
                    disabled={step === 0}
                    onClick={() => chooseStep(step - 1)}
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    aria-label="Next step"
                    disabled={step === path.steps.length - 1}
                    onClick={() => chooseStep(step + 1)}
                  >
                    <ChevronRight />
                  </button>
                  <button
                    aria-label="Reset trace"
                    onClick={() => {
                      chooseStep(0);
                      setZoom(1);
                    }}
                  >
                    <RotateCcw />
                  </button>
                  <select
                    aria-label="Playback speed"
                    value={speed}
                    onChange={(e) => setSpeed(+e.target.value)}
                  >
                    {[0.5, 1, 2].map((n) => (
                      <option key={n} value={n}>
                        {n}×
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="walk-grid">
                <div className="trace-column">
                  <div className="zoom-bar">
                    <small>Request path</small>
                    <div>
                      <button
                        aria-label="Zoom out"
                        disabled={zoom <= 0.8}
                        onClick={() => setZoom((x) => Math.max(0.8, x - 0.2))}
                      >
                        <Minus />
                      </button>
                      <button
                        aria-label="Zoom in"
                        disabled={zoom >= 1.8}
                        onClick={() => setZoom((x) => Math.min(1.8, x + 0.2))}
                      >
                        <Plus />
                      </button>
                      <button
                        aria-label="Fit diagram"
                        onClick={() => setZoom(1)}
                      >
                        <Maximize />
                      </button>
                    </div>
                  </div>
                  <DiagramViewport scale={zoom}>
                    <ol className="request-path">
                      {path.steps.map(([component, action, , data], i) => (
                        <li key={i}>
                          <button
                            className="trace-node"
                            aria-pressed={step === i}
                            onClick={() => chooseStep(i)}
                          >
                            <i>{String(i + 1).padStart(2, "0")}</i>
                            <span>
                              <small>{component}</small>
                              <strong>{action}</strong>
                            </span>
                          </button>
                          {step === i && (
                            <div className="mobile-step-note">
                              <p>{stage[2]}</p>
                              <SourceLink project={project} stage={stage} />
                            </div>
                          )}
                          {i < path.steps.length - 1 && (
                            <button
                              className={
                                "wire " +
                                (i === step && phase === 2 ? "wire-live" : "")
                              }
                              aria-label={"Inspect handoff: " + data}
                              onClick={() => chooseStep(i + 1)}
                            >
                              <ArrowDown size={15} />
                              {data}
                            </button>
                          )}
                        </li>
                      ))}
                    </ol>
                  </DiagramViewport>
                </div>
                <article className="step-detail" aria-live="polite">
                  <small>
                    Step {step + 1} of {path.steps.length} · {stage[0]}
                  </small>
                  <h4>{stage[1]}</h4>
                  <p>{stage[2]}</p>
                  <dl>
                    <div>
                      <dt>Receives</dt>
                      <dd>{step ? path.steps[step - 1][3] : path.input}</dd>
                    </div>
                    <div>
                      <dt>Produces</dt>
                      <dd>{stage[3]}</dd>
                    </div>
                  </dl>
                  <h5>Implementation</h5>
                  <SourceLink project={project} stage={stage} />
                </article>
              </div>
              <div className="walk-outcome">
                <div>
                  <h5>What the user gets</h5>
                  <p>{path.result}</p>
                </div>
                <div>
                  <h5>When the path changes</h5>
                  <p>{path.exception}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="design-why">
          <ScrollBackdrop motif="terrain" tone="paper" />
          <small>Engineering decision</small>
          <p>{design.reason}</p>
          <p>{project.tradeoff}</p>
        </div>
      </div>
    </section>
  );
}
