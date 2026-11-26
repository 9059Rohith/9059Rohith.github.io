import { ScrollBackdrop } from "./ScrollBackdrop";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

const surfaces = [
  { name: "Cork", bounce: 0.34 },
  { name: "Wood", bounce: 0.54 },
  { name: "Steel", bounce: 0.78 },
];
/** Integrate gravity and restitution in screen coordinates so each selected material has a visible, measurable bounce. */
export default function DropTest() {
  const area = useRef<HTMLDivElement>(null),
    disc = useRef<HTMLDivElement>(null),
    launch = useRef<() => void>(() => {}),
    surface = useRef(0.54);
  const [selected, setSelected] = useState(1),
    [hits, setHits] = useState(0);
  useEffect(() => {
    const pad = area.current!,
      board = disc.current!,
      motion = matchMedia("(prefers-reduced-motion: reduce)");
    let y = 0,
      v = 0,
      frame = 0,
      prev = 0,
      drag = false,
      offset = 0,
      contacts = 0;
    const limit = () => Math.max(1, pad.clientHeight - board.offsetHeight - 22);
    function paint() {
      board.style.transform =
        "translate(-50%, " +
        y +
        "px) rotate(" +
        (motion.matches ? 0 : (y / limit()) * 22 - 10) +
        "deg)";
    }
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      prev = 0;
    }
    function tick(t: number) {
      const dt = prev ? Math.min((t - prev) / 1000, 0.035) : 0.016;
      prev = t;
      v += Math.max(470, limit() * 4) * dt;
      y += v * dt;
      if (y >= limit()) {
        y = limit();
        contacts++;
        setHits(contacts);
        v = -v * surface.current;
        if (Math.abs(v) < 38) {
          paint();
          stop();
          return;
        }
      }
      paint();
      frame = requestAnimationFrame(tick);
    }
    function drop() {
      stop();
      contacts = 0;
      setHits(0);
      v = 0;
      if (motion.matches) {
        y = limit();
        setHits(1);
        paint();
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    launch.current = () => {
      y = 8;
      drop();
    };
    function down(e: PointerEvent) {
      stop();
      drag = true;
      offset = e.clientY - pad.getBoundingClientRect().top - y;
      board.setPointerCapture(e.pointerId);
    }
    function move(e: PointerEvent) {
      if (!drag) return;
      y = Math.min(
        limit(),
        Math.max(0, e.clientY - pad.getBoundingClientRect().top - offset),
      );
      paint();
    }
    function up() {
      if (drag) {
        drag = false;
        drop();
      }
    }
    function reset() {
      stop();
      y = limit() * 0.22;
      paint();
    }
    const ro = new ResizeObserver(reset);
    ro.observe(pad);
    motion.addEventListener("change", reset);
    board.addEventListener("pointerdown", down);
    board.addEventListener("pointermove", move);
    board.addEventListener("pointerup", up);
    board.addEventListener("pointercancel", up);
    reset();
    return () => {
      stop();
      ro.disconnect();
      motion.removeEventListener("change", reset);
      board.removeEventListener("pointerdown", down);
      board.removeEventListener("pointermove", move);
      board.removeEventListener("pointerup", up);
      board.removeEventListener("pointercancel", up);
    };
  }, []);
  return (
    <section className="drop-test section">
      <ScrollBackdrop motif="rings" tone="dark" />
      <div className="drop-copy">
        <div className="kicker">Interactive simulation</div>
        <h2>Drop test.</h2>
        <p>
          Pick a surface and drop the processor. The energy retained at impact
          changes how high it rebounds.
        </p>
        <div className="surface-options">
          {surfaces.map((s, i) => (
            <button
              key={s.name}
              aria-pressed={selected === i}
              onClick={() => {
                setSelected(i);
                surface.current = s.bounce;
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button className="primary" onClick={() => launch.current()}>
          Drop processor <ArrowDown size={16} />
        </button>
      </div>
      <div className="drop-stage" ref={area}>
        <div ref={disc} className="drop-disc" aria-hidden="true" />
        <span className="drop-line" />
        <output aria-label="Surface contact count">
          Impacts / {hits.toString().padStart(2, "0")}
        </output>
      </div>
    </section>
  );
}
