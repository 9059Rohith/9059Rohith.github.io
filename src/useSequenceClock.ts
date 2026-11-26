import { useEffect, useLayoutEffect, useRef } from "react";

/** Advance a chapter in visible-tab time, keeping its exact position across pause and speed changes. */
export function useSequenceClock(
  key: string,
  playing: boolean,
  duration: number,
  speed: number,
  paint: (fraction: number) => void,
  advance: () => void,
) {
  const fraction = useRef(0);
  const callbacks = useRef({ paint, advance });
  useLayoutEffect(() => {
    callbacks.current = { paint, advance };
  });
  function rewind() {
    fraction.current = 0;
    callbacks.current.paint(0);
  }
  useLayoutEffect(() => {
    rewind();
  }, [key]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      last = 0;
    function tick(now: number) {
      if (document.hidden) {
        last = 0;
        return;
      }
      if (last)
        fraction.current = Math.min(
          1,
          fraction.current + ((now - last) * speed) / duration,
        );
      last = now;
      callbacks.current.paint(fraction.current);
      if (fraction.current >= 1) {
        callbacks.current.advance();
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    }
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [key, playing, speed, duration]);
  return rewind;
}
