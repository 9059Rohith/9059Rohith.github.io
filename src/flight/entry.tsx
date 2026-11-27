import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
const diagram = new URLSearchParams(location.search).has("diagram");
const View = diagram
  ? lazy(() => import("./Diagram"))
  : lazy(() => import("./Flight"));
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={null}>
    <View />
  </Suspense>,
);
