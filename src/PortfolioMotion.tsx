import { useEffect, useId } from "react";

/** Use real viewport entry for chapter motion, including sections added by a lazy import. */
export function usePortfolioMotion() {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const selector =
      ".section h2,.case-caption h1,.intern-list article,.project-gallery article,.topology,.walk-intro,.editorial>div,.tech-detail,.timeline,.research-grid,.other,footer h2,.footline,.facts>div,.deep>div,.ai-list>div";
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("motion-in");
            observer.unobserve(e.target);
          }
      },
      { threshold: 0.05 },
    );
    function register(node: Element) {
      const items = [
        ...(node.matches(selector) ? [node] : []),
        ...node.querySelectorAll(selector),
      ];
      for (const el of items)
        if (!seen.has(el)) {
          seen.add(el);
          observer.observe(el);
        }
    }
    register(root);
    const changes = new MutationObserver((records) => {
      for (const record of records)
        for (const el of record.addedNodes)
          if (el instanceof Element) register(el);
    });
    changes.observe(root, { childList: true, subtree: true });
    return () => {
      changes.disconnect();
      observer.disconnect();
    };
  }, []);
}

/** Visualize the actual asynchronous module load without imposing an artificial loading delay. */
export function ArchitectureLoading() {
  const id = useId();
  return (
    <section
      className="section architecture-loading"
      aria-busy="true"
      role="status"
      aria-labelledby={id}
    >
      <div className="loading-net" aria-hidden="true">
        <span />
        <i />
        <span />
        <i />
        <span />
      </div>
      <h2 id={id}>Loading architecture</h2>
    </section>
  );
}

const strokes = [
  "M4 27 L32 27 L47 11 L76 11 L91 23 L131 23",
  "M4 25 Q38 -6 70 17 T131 16",
  "M4 18 H33 L45 7 H73 L87 18 H131 M33 18 L45 29 H73 L87 18",
];
/** Draw an internship-specific route, flight path or retrieval branch as its timeline row enters view. */
export function InternshipSignal({ index }: { index: number }) {
  return (
    <svg className="intern-signal" viewBox="0 0 136 36" aria-hidden="true">
      <path className="signal-ghost" d={strokes[index]} />
      <path className="signal-ink" pathLength="1" d={strokes[index]} />
      {(index === 0
        ? [
            [4, 27],
            [47, 11],
            [91, 23],
            [131, 23],
          ]
        : index === 1
          ? [
              [4, 25],
              [70, 17],
              [131, 16],
            ]
          : [
              [4, 18],
              [73, 7],
              [73, 29],
              [131, 18],
            ]
      ).map(([cx, cy]) => (
        <circle key={cx + "-" + cy} cx={cx} cy={cy} r={2.45} />
      ))}
    </svg>
  );
}
