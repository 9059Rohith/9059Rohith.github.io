import React, { useState, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  FileText,
  Search,
  Orbit,
} from "lucide-react";
import Field from "./Field";
import Artwork from "./Artwork";
import { projects, github, source, type Project } from "./projects";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource-variable/dm-sans/wght.css";
import "./style.css";
const Architecture = lazy(() => import("./Architecture")),
  Capabilities = lazy(() => import("./Capabilities"));
const resume = "/Rohith-Kumar-Dhamagatla.pdf",
  email = "rajuchaswik@gmail.com",
  linkedin = "https://www.linkedin.com/in/rohith-kumar-dhamagatla/";
function Nav() {
  const [open, set] = useState(false),
    [active, A] = useState("");
  useEffect(() => {
    const f = () => {
      let s = "";
      for (const id of ["work", "architecture", "about", "contact"]) {
        const e = document.getElementById(id);
        if (e && e.getBoundingClientRect().top < innerHeight * 0.48) s = id;
      }
      A(s);
    };
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header>
      <a href="/" className="brand" aria-label="Rohith home">
        <span>
          r<span className="branddot">.</span>k
        </span>
        <i />
        Rohith Kumar
      </a>
      <button
        className="mobile-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => set(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "open" : ""}>
        {[
          ["work", "Work"],
          ["architecture", "Architecture"],
          ["about", "About"],
          ["contact", "Contact"],
        ].map(([id, n]) => (
          <a
            key={id}
            className={active === id ? "active" : ""}
            href={"/#" + id}
            onClick={() => set(false)}
          >
            {n}
          </a>
        ))}
        <a className="navresume" href={resume}>
          Résumé <ArrowUpRight size={14} />
        </a>
      </nav>
    </header>
  );
}
function Work() {
  return (
    <section className="section" id="work">
      <div className="kicker">Selected work</div>
      <div className="section-title">
        <h2>
          Four systems <em>in practice.</em>
        </h2>
        <span className="mono">2025 — 2026</span>
      </div>
      <div className="works">
        {projects.map((p, i) => (
          <a
            className="work"
            key={p.id}
            href={"/projects/" + p.id}
            style={{ "--accent": p.accent } as React.CSSProperties}
          >
            <div className={"plate plate-" + i}>
              <span className="plate-label">{p.kind}</span>
              <Artwork p={p} />
            </div>
            <div className="work-title">
              <h3>{p.name}</h3>
              <ArrowUpRight />
            </div>
            <p>{p.intro}</p>
            <small>{p.stack.slice(0, 4).join("  /  ")}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
const ai = [
  [
    "Acoustic inference",
    "VaakMitra",
    "A model evaluates a recorded vowel and returns a practice assessment. The unit of work is one recording.",
  ],
  [
    "Language models",
    "Skylark Signal",
    "A model interprets a question and explains the calculated result. Python owns the arithmetic.",
  ],
  [
    "Retrieval-augmented generation",
    "Saathi AI",
    "During my internship, I integrated document processing, semantic retrieval and LLM inference so responses could draw on retrieved context.",
  ],
  [
    "Workflow orchestration",
    "VaakMitra",
    "Seven rule-based agents turn progress records into review items, recommended games and caregiver summaries.",
  ],
  [
    "Approved tool execution",
    "LIFE-OS",
    "A plan proposes specific actions. The user approves their arguments, the executor calls supported providers, and a separate read checks the result.",
  ],
];
function Intelligence() {
  const [i, set] = useState(4);
  return (
    <section className="section editorial">
      <div>
        <div className="kicker">AI systems</div>
        <h2>
          From inference
          <br />
          to <em>action.</em>
        </h2>
      </div>
      <div className="ai-list">
        {ai.map(([name, p, body], k) => (
          <div key={name}>
            <button aria-expanded={i === k} onClick={() => set(k)}>
              {name}
              <span>{i === k ? "−" : "+"}</span>
            </button>
            {i === k && (
              <article>
                <small>{p}</small>
                <p>{body}</p>
                {p === "LIFE-OS" && (
                  <a href="/projects/life-os#architecture">
                    Trace the approval workflow ↗
                  </a>
                )}
              </article>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
const other = [
  [
    "Multi-Agent Warehouse",
    "Autonomous-AI-Powered-Multi-Agent-Warehouse-Fulfillment-System",
    "Coordinates warehouse robots with A* and conflict-based search.",
    "Python · Streamlit",
  ],
  [
    "Prowider",
    "prowider",
    "Distributes leads fairly with round-robin allocation and server-sent updates.",
    "Next.js · Prisma · PostgreSQL",
  ],
  [
    "MessageOps",
    "messageops",
    "Turns meeting transcripts into assigned tasks with deadlines and follow-ups.",
    "LLM workflows · Automation",
  ],
  [
    "OAuthPath",
    "oauthpath",
    "Guides developers through provider-specific OAuth setup.",
    "Next.js · TypeScript",
  ],
  [
    "StellarStep",
    "stellarstep",
    "Supports routines and sensory regulation through a space-themed interface.",
    "MongoDB · Express · React · Node.js",
  ],
  [
    "TARS",
    "tars",
    "Connects people through direct messages, group chat and presence updates.",
    "TypeScript · Real-time messaging",
  ],
  [
    "Resume Skill Matcher",
    "Resume_skill_matcher",
    "Compares a résumé with a target role and identifies skill gaps.",
    "TypeScript · NLP",
  ],
];
function Others() {
  const [q, S] = useState("");
  const list = other.filter((r) =>
    r.join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <section className="section compact">
      <div className="section-title">
        <h2>Other Projects</h2>
        <label className="search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => S(e.target.value)}
            placeholder="Search projects"
            aria-label="Search other projects"
          />
        </label>
      </div>
      {list.map(([n, r, d, t]) => (
        <div className="other" key={r}>
          <a href={github + "/" + r}>{n} ↗</a>
          <p>{d}</p>
          <small>
            {t}
            {r === "oauthpath" && (
              <>
                {" "}
                · <a href="https://oauthpath-drab.vercel.app">Demo ↗</a>
              </>
            )}
          </small>
        </div>
      ))}
      {!list.length && <p>No projects match “{q}”.</p>}
    </section>
  );
}
function About() {
  return (
    <section className="section editorial" id="about">
      <div>
        <div className="kicker">About Rohith</div>
        <h2>
          Behind the <em>systems.</em>
        </h2>
      </div>
      <div>
        <p className="pull">
          I like the part of engineering where a model’s output becomes
          someone’s next decision.
        </p>
        <p>
          I'm Rohith Kumar Dhamagatla, a computer science student from
          Anantapur, India. My work spans speech, retrieval, real-time
          applications and software that acts across services. I build the
          interface, follow the request through the backend and check what the
          user actually receives.
        </p>
        <p>
          I'm interested in applied AI and full-stack engineering opportunities
          where I can work on that whole path.
        </p>
      </div>
    </section>
  );
}
function History() {
  return (
    <section className="section compact">
      <div className="kicker">Experience & education</div>
      <h2>Field experience.</h2>
      {[
        [
          "Jun – Oct 2026",
          "Software Developer Intern",
          "Trickee Technologies",
          "GPS telemetry, trip lifecycle APIs, route optimization and energy prediction for an electric fleet platform.",
        ],
        [
          "Jan – May 2026",
          "Full Stack Developer Intern",
          "EKAM",
          "MERN travel-platform features, transaction flows and REST APIs for TravelSeasons.",
        ],
        [
          "Jul – Dec 2025",
          "AI/ML Developer Intern",
          "RYL NeuroAcademy",
          "Document processing, embeddings and semantic retrieval for Saathi AI.",
        ],
        [
          "2023 – 2027",
          "B.Tech · Computer Science",
          "Amrita Vishwa Vidyapeetham",
          "Coimbatore · Expected graduation 2027.",
        ],
        [
          "2024 – 2028",
          "B.S. · Data Science and Applications",
          "IIT Madras",
          "Online degree program.",
        ],
      ].map(([date, n, org, desc]) => (
        <div className="timeline" key={n}>
          <small>{date}</small>
          <div>
            <h3>{n}</h3>
            <b>{org}</b>
            <p>{desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
function Research() {
  return (
    <section className="section research">
      <div className="kicker">Research & achievements</div>
      <h2>
        Looking inside <em>the model.</em>
      </h2>
      <div className="research-grid">
        <div>
          <small>IEEE ICSADL · 2026</small>
          <h3>Lung nodule classification</h3>
          <p>
            Applied GoogLeNet to the LUNA16 dataset for automated
            classification. The study reports 96% test accuracy and uses
            Grad-CAM to visualize the image regions that contributed to
            predictions.
          </p>
          <a href="https://doi.org/10.1109/ICSADL67539.2026.11452024">
            Read the publication ↗
          </a>
        </div>
        <ul>
          {[
            "TCS CodeVita Season 12 · IIT Madras finalist",
            "Google PromptWars 2026 · 8th nationally",
            "Amazon ML Summer School 2026 · Selected participant",
            "Google Student Ambassador · 15+ technical sessions",
            "FIN HACK101 · Third place",
            "National-level swimming · Andhra Pradesh",
          ].map((t) => (
            <li key={t}>{t}</li>
          ))}
          <li>
            <a href="https://github.com/Shyam-Sundar-Raju/Plant_disease_detection/pull/16">
              Open source · Offline spoken treatment instructions in seven
              languages ↗
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer id="contact">
      <div className="kicker">
        <i /> Get in touch
      </div>
      <h2>
        Have a problem
        <br />
        <em>worth building for?</em>
      </h2>
      <a className="mail" href={"mailto:" + email}>
        {email} <ArrowUpRight />
      </a>
      <div className="footline">
        <span>Rohith Kumar Dhamagatla · Anantapur, India</span>
        <div>
          <a href={github}>GitHub ↗</a>
          <a href={linkedin}>LinkedIn ↗</a>
          <a href={resume}>Résumé ↗</a>
        </div>
      </div>
    </footer>
  );
}
function Deep({ p }: { p: Project }) {
  return (
    <div className="deep">
      {[
        ["The problem", p.problem],
        ["Implementation", p.decision],
        ["Trade-off", p.tradeoff],
        ["Next experiment", p.future],
      ].map(([n, t]) => (
        <div key={n}>
          <small>{n}</small>
          <p>{t}</p>
        </div>
      ))}
    </div>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <div className="kicker">
            <i /> Available for opportunities
          </div>
          <h1>
            Rohith Kumar
            <br />
            <em>Dhamagatla.</em>
          </h1>
          <h3>
            Full-Stack Developer <span>/</span> AI & ML Engineer
          </h3>
          <p>
            I build speech tools, decision systems and AI agents with a clear
            path from input to outcome.
          </p>
          <div className="actions">
            <a className="primary" href="#work">
              Explore my work <ArrowDownRight size={17} />
            </a>
            <a className="secondary" href={resume}>
              <FileText size={16} /> View résumé
            </a>
          </div>
        </div>
        <Field />
        <div className="hero-foot">
          <span>
            <Orbit size={15} /> Anantapur, India
          </span>
          <a href="#work">
            Scroll to explore <ArrowDown size={15} />
          </a>
        </div>
      </section>
      <Work />
      <Suspense fallback={<p>Loading architecture…</p>}>
        <Architecture />
      </Suspense>
      <Intelligence />
      <section className="section compact">
        <div className="kicker">Technical deep dives</div>
        <h2>Engineering decisions.</h2>
        {projects.map((p) => (
          <details key={p.id}>
            <summary>
              {p.name} <span>{p.kind}</span>
            </summary>
            <Deep p={p} />
            <a href={source(p, p.flows[0][1][1])}>Read the implementation ↗</a>
          </details>
        ))}
      </section>
      <About />
      <Suspense>
        <Capabilities />
      </Suspense>
      <History />
      <Research />
      <Others />
    </>
  );
}
function Case({ p }: { p: Project }) {
  useEffect(() => {
    document.title = p.name + " — Rohith Kumar Dhamagatla";
  }, [p]);
  return (
    <>
      <section className="section case">
        <a href="/#work">← Selected work</a>
        <div className="kicker">{p.kind}</div>
        <h1>{p.name}</h1>
        <p className="pull">{p.intro}</p>
        <div className="actions">
          <a className="primary" href={p.link}>
            {p.linkLabel} <ArrowUpRight size={15} />
          </a>
          <a className="secondary" href={github + "/" + p.repo}>
            GitHub ↗
          </a>
        </div>
        <div className="caseart">
          <Artwork p={p} />
        </div>
        <div className="facts">
          <div>
            <small>Contribution</small>
            <p>{p.role}</p>
          </div>
          <div>
            <small>Technologies</small>
            <p>{p.stack.join(" · ")}</p>
          </div>
          <div>
            <small>Implementation</small>
            <p>
              {p.id === "udhyogapay"
                ? "Interactive matching demo. Full marketplace host reported a quota limit."
                : p.id === "life-os"
                  ? "Interactive demo with simulated provider actions."
                  : "Implemented, with a hosted demo."}
            </p>
          </div>
        </div>
        <Deep p={p} />
      </section>
      <Suspense>
        <Architecture initial={p} />
      </Suspense>
      <div className="section next">
        <a href={"/projects/" + projects[(projects.indexOf(p) + 1) % 4].id}>
          Next case study · {projects[(projects.indexOf(p) + 1) % 4].name}{" "}
          <ArrowRight />
        </a>
      </div>
    </>
  );
}
function App() {
  const id = location.pathname.split("/")[2];
  const p = projects.find((q) => id === q.id);
  useEffect(() => {
    if (!location.hash) return;
    const find = () => document.getElementById(location.hash.slice(1));
    if (find()) {
      find()?.scrollIntoView();
      return;
    }
    const o = new MutationObserver(() => {
      if (find()) {
        find()?.scrollIntoView();
        o.disconnect();
      }
    });
    o.observe(document.body, { childList: true, subtree: true });
    return () => o.disconnect();
  }, []);
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Nav />
      <main id="main">{p ? <Case p={p} /> : <Home />}</main>
      <Footer />
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
