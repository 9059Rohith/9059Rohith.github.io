import { useEffect, type CSSProperties } from "react";

type Motif =
  | "terrain"
  | "circuit"
  | "ribbon"
  | "orbit"
  | "lattice"
  | "rings"
  | "light";
const round = (value: number) => Number(value.toFixed(1));

/** Keep the drawing in a clipped, non-interactive layer underneath the section's readable content. */
export function ScrollBackdrop({
  motif,
  tone = "dark",
  reverse = false,
}: {
  motif: Motif;
  tone?: "dark" | "paper" | "olive" | "desk";
  reverse?: boolean;
}) {
  return (
    <span
      className="scroll-field"
      data-motif={motif}
      data-tone={tone}
      data-reverse={reverse}
      aria-hidden="true"
      style={
        {
          "--field-mask":
            motif === "light" ? "none" : `url(/fields/${motif}.svg)`,
        } as CSSProperties
      }
    >
      <i className="field-light" />
      <i className="field-drawing" />
      <i className="field-dust" />
    </span>
  );
}

/** Drive only visible surfaces from native scroll position. Pinned scenes use their full scroll rail as the timeline. */
export function useScrollBackdrops() {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const registered = new Set<HTMLElement>(),
      visible = new Set<HTMLElement>(),
      media = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    function update() {
      raf = 0;
      const vh = document.documentElement.clientHeight;
      const poses = Array.from(visible, (field) => {
        const rail = field.closest(".studio-rail,.screen-rail");
        const r = (rail ?? field).getBoundingClientRect();
        const progress = media.matches
          ? 0.5
          : Math.max(
              0,
              Math.min(
                1,
                rail
                  ? -r.top / Math.max(1, r.height - vh)
                  : (vh - r.top) / Math.max(1, vh + r.height),
              ),
            );
        const p = (progress - 0.5) * 2,
          direction = field.dataset.reverse === "true" ? -1 : 1;
        return { field, p, direction };
      });
      for (const { field, p, direction } of poses) {
        field.style.setProperty("--field-x", round(p * 56 * direction) + "px");
        field.style.setProperty("--field-y", round(p * 112) + "px");
        field.style.setProperty("--field-far", round(p * -42) + "px");
        field.style.setProperty(
          "--field-tilt",
          round(p * 3.4 * direction) + "deg",
        );
      }
    }
    function schedule() {
      if (!raf && !document.hidden) raf = requestAnimationFrame(update);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const field = e.target as HTMLElement;
          if (e.isIntersecting) visible.add(field);
          else visible.delete(field);
        }
        schedule();
      },
      { rootMargin: "100px 0px" },
    );
    function scan() {
      for (const field of registered)
        if (!field.isConnected) {
          observer.unobserve(field);
          registered.delete(field);
          visible.delete(field);
        }
      for (const el of root!.querySelectorAll<HTMLElement>(".scroll-field"))
        if (!registered.has(el)) {
          registered.add(el);
          observer.observe(el);
        }
      schedule();
    }
    const mutation = new MutationObserver((records) => {
      if (
        records.some((r) =>
          [...r.addedNodes, ...r.removedNodes].some(
            (n) =>
              n instanceof Element &&
              (n.matches(".scroll-field") || n.querySelector(".scroll-field")),
          ),
        )
      )
        scan();
    });
    scan();
    mutation.observe(root, { childList: true, subtree: true });
    function onScroll() {
      if (!media.matches) schedule();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      cancelAnimationFrame(raf);
      mutation.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);
}
