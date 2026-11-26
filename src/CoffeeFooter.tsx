import { useEffect, useRef, useState } from "react";
import { ArrowUpFromLine, Thermometer } from "lucide-react";

/** Load the closing scene only when approached and stop its render loop while the footer is off screen. */
export default function CoffeeFooter() {
  const host = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    settings = useRef({ thermal: false, lift: false }),
    invalidate = useRef<() => void>(() => {});
  const [thermal, setThermal] = useState(false),
    [lift, setLift] = useState(false);
  useEffect(() => {
    settings.current = { thermal, lift };
    invalidate.current();
  }, [thermal, lift]);
  useEffect(() => {
    const el = host.current!,
      surface = canvas.current!,
      reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let api: ReturnType<
        (typeof import("./coffeeStudio"))["createCoffeeStudio"]
      >,
      loading = false,
      alive = true,
      visible = false,
      raf = 0,
      last = 0,
      t = 0,
      yaw = 0.12,
      target = 0.12,
      up = 0,
      drag: number | null = null;
    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden || !api) return;
      if (!reduced.matches && now - last < 32) {
        schedule();
        return;
      }
      const dt = Math.min(0.06, Math.max(0, (now - last) / 1000));
      last = now;
      t += dt;
      const lerp = reduced.matches ? 1 : 1 - Math.exp(-dt * 9);
      yaw += (target - yaw) * lerp;
      up += (Number(settings.current.lift) - up) * lerp;
      const entry = reduced.matches
        ? 1
        : Math.min(
            1,
            Math.max(
              0,
              (innerHeight - el.getBoundingClientRect().top) /
                (el.clientHeight * 0.64),
            ),
          );
      api.draw(
        yaw,
        up,
        entry,
        reduced.matches ? 0 : t,
        settings.current.thermal,
      );
      el.classList.add("coffee-ready");
      if (!reduced.matches) schedule();
    }
    function schedule() {
      if (!raf && visible && !document.hidden)
        raf = requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver(async ([e]) => {
      visible = e.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      if (!api && !loading) {
        loading = true;
        try {
          const m = await import("./coffeeStudio");
          if (alive) api = m.createCoffeeStudio(surface);
        } catch {
          /* The illustrated cup is visible when graphics initialization fails. */
        }
      }
      if (alive) schedule();
    });
    io.observe(el);
    const ro = new ResizeObserver(schedule);
    ro.observe(surface);
    function down(e: PointerEvent) {
      drag = e.clientX;
      surface.setPointerCapture(e.pointerId);
    }
    function move(e: PointerEvent) {
      if (drag !== null) {
        target += (e.clientX - drag) * 0.018;
        drag = e.clientX;
        schedule();
      }
    }
    const release = () => {
      drag = null;
    };
    function sync() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else schedule();
    }
    function lost() {
      el.classList.remove("coffee-ready");
      visible = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }
    surface.addEventListener("pointerdown", down);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerup", release);
    surface.addEventListener("pointercancel", release);
    surface.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", schedule);
    invalidate.current = schedule;
    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      api?.dispose();
      invalidate.current = () => {};
      surface.removeEventListener("pointerdown", down);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", release);
      surface.removeEventListener("pointercancel", release);
      surface.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <figure
      className="coffee-art"
      ref={host}
      data-thermal={thermal}
      data-lift={lift}
    >
      <div className="coffee-backdrop" />
      <div className="coffee-poster" aria-hidden="true">
        <i className="poster-handle" />
        <i className="poster-tasse" />
        <i className="poster-espresso" />
      </div>
      <canvas
        ref={canvas}
        aria-label="A ceramic espresso cup on a copper coaster. Drag to rotate."
      />
      <figcaption>
        <button aria-pressed={thermal} onClick={() => setThermal(!thermal)}>
          <Thermometer size={14} />
          {thermal ? "Ceramic view" : "Thermal view"}
        </button>
        <button aria-pressed={lift} onClick={() => setLift(!lift)}>
          <ArrowUpFromLine size={14} />
          {lift ? "Set cup down" : "Lift cup"}
        </button>
      </figcaption>
    </figure>
  );
}
