import {
  ArrowUpRight,
  Waypoints,
  MapPinned,
  MessagesSquare,
  Workflow,
} from "lucide-react";
import { github, projects } from "./projects";

const roles = [
  {
    company: "Trickee Technologies",
    role: "Software Developer Intern",
    time: "Jun – Oct 2026",
    location: "Remote",
    product: "GPS-first EV intelligence platform",
    work: "Built FastAPI endpoints that ingested GPS telemetry and tracked electric vehicles. Stored trip records in PostgreSQL and developed route optimization and energy prediction workflows for the fleet platform and Android app.",
    stack: "Python · FastAPI · PostgreSQL · Redis · Docker",
    icon: Waypoints,
  },
  {
    company: "EKAM",
    role: "Full Stack Developer Intern",
    time: "Jan – May 2026",
    location: "Remote",
    product: "TravelSeasons travel platform",
    work: "Translated client requirements into responsive travel interfaces and REST APIs. Connected customer-facing screens to transaction workflows across the React frontend, Express backend and MongoDB database.",
    stack: "MongoDB · Express · React · Node.js",
    icon: MapPinned,
  },
  {
    company: "RYL NeuroAcademy",
    role: "AI/ML Developer Intern",
    time: "Jul – Dec 2025",
    location: "On-site",
    product: "Saathi AI mental wellness platform",
    work: "Connected document processing, embeddings and semantic search to a conversational application. Built FastAPI services that retrieved relevant context before the language model generated a response.",
    stack: "Python · FastAPI · Embeddings · Retrieval-augmented generation",
    icon: MessagesSquare,
  },
];

/** Present the résumé's internship timeline in reverse chronological order. */
export function Internships() {
  return (
    <section className="section internships" id="internships">
      <div className="section-label">Professional experience</div>
      <h2>Internships</h2>
      <div className="intern-list">
        {roles.map(({ icon: Icon, ...r }) => (
          <article key={r.company}>
            <div className="intern-date">
              <Icon size={24} />
              <span>{r.time}</span>
              <small>{r.location}</small>
            </div>
            <div className="intern-role">
              <h3>{r.company}</h3>
              <p>{r.role}</p>
            </div>
            <div className="intern-work">
              <h4>{r.product}</h4>
              <p>{r.work}</p>
              <small>{r.stack}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Keep every featured project visible, with direct destinations for its demo, code and architecture. */
export function ProjectIndex() {
  return (
    <section className="section project-index" id="work">
      <div className="section-label">Selected engineering work</div>
      <h2>Projects</h2>
      <div className="project-gallery">
        {projects.map((p) => (
          <article
            key={p.id}
            style={{ "--tone": p.accent } as React.CSSProperties}
          >
            <a
              className="project-shot"
              href={"/projects/" + p.id + "/"}
              aria-label={"Open " + p.name + " case study"}
            >
              <img
                src={"/studio/" + p.id + ".webp"}
                width={1140}
                height={790}
                loading="lazy"
                alt={p.name + " application interface"}
              />
            </a>
            <div className="project-info">
              <small>{p.kind}</small>
              <h3>
                <a href={"/projects/" + p.id + "/"}>
                  {p.name} <ArrowUpRight />
                </a>
              </h3>
              <p>{p.intro}</p>
              <span>{p.stack.join(" · ")}</span>
              <div className="project-links">
                <a href={"/?system=" + p.id + "#architecture"}>
                  <Workflow size={15} /> Architecture
                </a>
                <a href={p.link}>
                  {p.id === "udhyogapay" ? "Matching demo" : "Live demo"} ↗
                </a>
                <a href={github + "/" + p.repo}>GitHub ↗</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
