import { useEffect, type CSSProperties } from "react";

type Model = "udhyogapay" | "vaakmitra" | "life-os" | "skylark";

/** Match each case study to its own photographed miniature, including links opened directly. */
export function projectModel(id: string): Model {
  return id === "udhyogapay" || id === "vaakmitra" || id === "skylark"
    ? id
    : "life-os";
}

/** Give each scene a static product photograph until its turntable has decoded. */
export function ScrollBackdrop({
  model,
  tone = "dark",
  reverse = false,
}: {
  model: Model;
  tone?: "dark" | "paper" | "olive";
  reverse?: boolean;
}) {
  return (
    <span
      className="scroll-field"
      data-model={model}
      data-tone={tone}
      data-reverse={reverse}
      aria-hidden="true"
      style={
        {
          "--still": `url("/miniatures/${model}.webp")`,
          "--turn": `url("/miniatures/${model}-turn.webp")`,
        } as CSSProperties
      }
    >
      <span className="model-turntable" />
    </span>
  );
}

/** Scrub the baked 3D camera and mechanism poses with scroll, sharing four atlases across the entire site. */
export function useScrollBackdrops() {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const visible = new Set<HTMLElement>(),
      registered = new Set<HTMLElement>();
    const atlases = new Map<string, Promise<void>>();
    let frame = 0,
      disposed = false;
    function load(field: HTMLElement) {
      const model = field.dataset.model!;
      if (motion.matches || field.dataset.loaded === model) return;
      let promise = atlases.get(model);
      if (!promise) {
        const img = new Image();
        img.src = "/miniatures/" + model + "-turn.webp";
        promise = img.decode();
        atlases.set(model, promise);
      }
      promise
        .then(() => {
          if (disposed || !field.isConnected || model !== field.dataset.model)
            return;
          field.dataset.loaded = model;
          schedule();
        })
        .catch(() => {
          atlases.delete(model);
        });
    }
    function update() {
      frame = 0;
      const height = document.documentElement.clientHeight;
      const poses = Array.from(visible, (field) => {
        const stage = field.querySelector<HTMLElement>(".model-turntable")!;
        const rail = field.closest(".screen-rail");
        const rect = (rail || stage).getBoundingClientRect();
        const progress = rail
          ? -rect.top / Math.max(1, rect.height - height)
          : (height - rect.top) / (height + rect.height);
        const t = motion.matches ? 0.5 : Math.min(1, Math.max(0, progress));
        return {
          field,
          index: Math.round(
            (field.dataset.reverse === "true" ? 1 - t : t) * 41,
          ),
        };
      });
      for (const { field, index } of poses) {
        if (field.dataset.frame === String(index)) continue;
        field.dataset.frame = String(index);
        field.style.setProperty("--frame-x", ((index % 7) * 100) / 6 + "%");
        field.style.setProperty("--frame-y", Math.floor(index / 7) * 20 + "%");
      }
    }
    function schedule() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const field = entry.target.parentElement!;
          if (entry.isIntersecting) {
            visible.add(field);
            load(field);
          } else visible.delete(field);
        }
        schedule();
      },
      { rootMargin: "180px 0px" },
    );
    function scan() {
      for (const field of registered)
        if (!field.isConnected) {
          observer.unobserve(field.firstElementChild!);
          registered.delete(field);
          visible.delete(field);
        }
      for (const field of root!.querySelectorAll<HTMLElement>(".scroll-field"))
        if (!registered.has(field)) {
          registered.add(field);
          observer.observe(field.firstElementChild!);
        }
      schedule();
    }
    const changes = new MutationObserver((records) => {
      for (const record of records)
        if (record.type === "attributes") {
          const field = record.target as HTMLElement;
          delete field.dataset.loaded;
          if (visible.has(field)) load(field);
        }
      if (
        records.some((record) =>
          [...record.addedNodes, ...record.removedNodes].some(
            (node) =>
              node instanceof Element &&
              (node.matches(".scroll-field") ||
                node.querySelector(".scroll-field")),
          ),
        )
      )
        scan();
    });
    scan();
    changes.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-model"],
    });
    function scroll() {
      if (!motion.matches) schedule();
    }
    function preference() {
      visible.forEach(load);
      schedule();
    }
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", preference);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      changes.disconnect();
      motion.removeEventListener("change", preference);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);
}
