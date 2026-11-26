import React, { useState, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, ArrowUpRight, Menu, X, Search } from "lucide-react";
import { StudioHero, CasePoster, SignalLab } from "./Studio";
import ScreenSequence from "./ScreenSequence";
import DropTest from "./DropTest";
import { Internships, ProjectIndex } from "./PortfolioSections";
import { projects, github, source, type Project } from "./projects";
import "@fontsource-variable/dm-sans/wght.css";
import "./style.css";
import "./studio.css";
import "./atlas.css";
import "./motion.css";
import CoffeeFooter from "./CoffeeFooter";
import { ArchitectureLoading, usePortfolioMotion } from "./PortfolioMotion";
const Architecture = lazy(() => import("./ArchitectureGuide")),
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
      for (const id of [
        "internships",
        "work",
        "architecture",
        "about",
        "contact",
      ]) {
        const e = document.getElementById(id);
        if (e && e.getBoundingClientRect().top < innerHeight * 0.48) s = id;
      }
      A(s);
    };
    const sync = () => {
      f();
      document.documentElement.style.setProperty(
        "--page-progress",
        String(
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      );
      document.body.classList.toggle("scrolled", scrollY > innerHeight * 0.28);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);
  return (
    <header
      className={open ? "menu-open" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          set(false);
          document.querySelector<HTMLButtonElement>(".mobile-toggle")?.focus();
        }
      }}
    >
      <a href="/" className="brand" aria-label="Rohith home">
        ROHITH
      </a>
      <button
        className="mobile-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => set(!open)}
      >
        {open ? (
          <>
            Close <X size={16} />
          </>
        ) : (
          <>
            Menu <Menu size={16} />
          </>
        )}
      </button>
      <nav className={open ? "open" : ""}>
        {[
          ["internships", "Internships"],
          ["work", "Projects"],
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
      <div className="reading-progress" aria-hidden="true" />
    </header>
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
function Education() {
  return (
    <section className="section compact">
      <h2>Education</h2>
      {[
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
          <div className="research-pipeline" aria-label="Research method">
            <span>LUNA16</span>
            <i />
            <span>GoogLeNet</span>
            <i />
            <span>Grad-CAM</span>
          </div>
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
      <div className="coffee-closing">
        <div className="closing-copy">
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
        </div>
        <CoffeeFooter />
      </div>
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
      <StudioHero />
      <Internships />
      <ProjectIndex />
      <Suspense fallback={<ArchitectureLoading />}>
        <Architecture />
      </Suspense>
      <ScreenSequence />
      <Intelligence />
      <SignalLab />
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
      <Education />
      <Research />
      <Others />
      <DropTest />
    </>
  );
}
function Case({ p }: { p: Project }) {
  useEffect(() => {
    document.title = p.name + " — Rohith Kumar Dhamagatla";
  }, [p]);
  return (
    <>
      <CasePoster p={p} />
      <section className="section case">
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
      <Suspense fallback={<ArchitectureLoading />}>
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
  usePortfolioMotion();
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
