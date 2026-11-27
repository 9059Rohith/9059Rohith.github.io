import ArchitectureGuide from "../ArchitectureGuide";
import "../style.css";
import "../atlas.css";
import "../motion.css";
import { projects } from "../projects";
export default function Diagram() {
  const project = projects.find(
    (p) => p.id === new URLSearchParams(location.search).get("diagram"),
  );
  return (
    <main>
      <ArchitectureGuide initial={project} />
    </main>
  );
}
