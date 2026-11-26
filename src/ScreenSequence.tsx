import { ScrollBackdrop } from "./ScrollBackdrop";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ScanLine } from "lucide-react";
import Artwork from "./Artwork";
import { projects } from "./projects";

/** Scrub four captured interfaces with native scroll; the inspection view overlays the corresponding signal diagram. */
export default function ScreenSequence() {
  const rail = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0),
    [scan, setScan] = useState(false);
  const p = projects[index];
  useEffect(() => {
    const section = rail.current!,
      surface = stage.current!,
      motion = matchMedia("(prefers-reduced-motion: reduce)");
    let tick = 0;
    function measure() {
      tick = 0;
      const span = section.offsetHeight - surface.offsetHeight;
      if (span <= 0) return;
      const progress = Math.min(
        0.999999,
        Math.max(0, -section.getBoundingClientRect().top / span),
      );
      const chapter = Math.floor(progress * 4),
        local = progress * 4 - chapter;
      setIndex(chapter);
      surface.style.setProperty(
        "--screen-tilt",
        motion.matches ? "0deg" : 2.5 - local * 5 + "deg",
      );
      surface.style.setProperty(
        "--screen-lift",
        motion.matches ? "0px" : 10 - local * 20 + "px",
      );
    }
    function update() {
      if (!tick) tick = requestAnimationFrame(measure);
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    measure();
    return () => {
      cancelAnimationFrame(tick);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  function jump(i: number) {
    const s = rail.current!,
      span = s.offsetHeight - stage.current!.offsetHeight;
    window.scrollTo({
      top:
        window.scrollY + s.getBoundingClientRect().top + (span * (i + 0.4)) / 4,
      behavior: "instant",
    });
  }
  return (
    <section
      className="screen-rail"
      ref={rail}
      aria-label="Project interface walkthrough"
    >
      <div
        className="screen-stage"
        ref={stage}
        style={{ "--accent": p.accent } as React.CSSProperties}
      >
        <ScrollBackdrop motif="ribbon" />
        <div className="screen-heading">
          <small>Interface walkthrough</small>
          <h2>{p.name}</h2>
        </div>
        <div
          className="screen-frame"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty(
              "--lens-x",
              ((e.clientX - rect.left) / rect.width) * 100 + "%",
            );
            e.currentTarget.style.setProperty(
              "--lens-y",
              ((e.clientY - rect.top) / rect.height) * 100 + "%",
            );
          }}
        >
          <div className="frame-top">
            <i />
            <span>{p.kind}</span>
            <b />
          </div>
          <div className={"frame-image " + (scan ? "scanned" : "")}>
            <img
              key={p.id}
              src={"/studio/" + p.id + ".webp"}
              alt={p.name + " application interface"}
              loading="lazy"
            />
            <div className="scan-layer" aria-hidden="true">
              <Artwork p={p} />
            </div>
          </div>
        </div>
        <div className="screen-bottom">
          <div className="screen-links">
            {projects.map((q, i) => (
              <button
                key={q.id}
                aria-label={"Go to " + q.name + " interface"}
                aria-pressed={i === index}
                onClick={() => jump(i)}
              >
                0{i + 1}
              </button>
            ))}
          </div>
          <button
            className="scan-control"
            aria-pressed={scan}
            onClick={() => setScan(!scan)}
          >
            <ScanLine size={15} />
            {scan ? "Show interface" : "Inspect signal"}
          </button>
          <a href={"/projects/" + p.id + "/"}>
            Open case study <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
