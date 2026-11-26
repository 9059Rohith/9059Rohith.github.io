import { useState } from "react";
import {
  siPython,
  siTypescript,
  siReact,
  siNextdotjs,
  siFastapi,
  siNodedotjs,
  siExpress,
  siPostgresql,
  siMongodb,
  siRedis,
  siPytorch,
  siLanggraph,
  siDocker,
  siGit,
  siJavascript,
  siCplusplus,
  siGraphql,
  siKotlin,
  siSocketdotio,
} from "simple-icons";
const groups = [
  {
    name: "Languages",
    items: [
      [
        siPython,
        "Calculates business metrics in Skylark and runs the learning pipeline in VaakMitra.",
      ],
      [
        siTypescript,
        "Types marketplace worker records, matching requests and API responses.",
      ],
      [siJavascript, "Powers the browser recording lifecycle in VaakMitra."],
      [
        siKotlin,
        "Implements the native Android practice client and microphone controls.",
      ],
      [siCplusplus, "Part of my systems programming and algorithms toolkit."],
    ],
  },
  {
    name: "Interfaces",
    items: [
      [
        siReact,
        "Builds the LIFE-OS review screen where a user approves exact actions.",
      ],
      [
        siNextdotjs,
        "Keeps the Skylark chat proxy and provider credentials on the server.",
      ],
    ],
  },
  {
    name: "Services",
    items: [
      [siFastapi, "Accepts Tamil audio attempts and serves learning progress."],
      [
        siNodedotjs,
        "Runs the UdhyogaPay marketplace API and standalone matching service.",
      ],
      [
        siExpress,
        "Routes authenticated marketplace booking and payment requests.",
      ],
      [siSocketdotio, "Delivers live marketplace events to connected clients."],
      [siGraphql, "Reads monday.com deal and work-order boards for Skylark."],
    ],
  },
  {
    name: "Storage",
    items: [
      [
        siPostgresql,
        "Stores LIFE-OS events and audit records in the Compose deployment.",
      ],
      [
        siMongodb,
        "Stores bookings in UdhyogaPay and speech practice history in VaakMitra.",
      ],
      [
        siRedis,
        "Coordinates optional per-owner execution locks across LIFE-OS replicas.",
      ],
    ],
  },
  {
    name: "AI / ML",
    items: [
      [
        siPytorch,
        "Supports speech inference and model loading in the full Tamil ASR environment.",
      ],
      [
        siLanggraph,
        "Routes questions through retrieval, cleaning, arithmetic and answer synthesis in Skylark.",
      ],
    ],
  },
  {
    name: "Infrastructure",
    items: [
      [
        siDocker,
        "Packages the frontend and API services for reproducible deployments.",
      ],
      [
        siGit,
        "Tracks the source revisions behind each case study and architecture view.",
      ],
    ],
  },
] as const;
export default function Capabilities() {
  const [g, G] = useState(0),
    [i, I] = useState(0);
  const items = groups[g].items;
  return (
    <section id="capabilities" className="section compact">
      <div className="kicker">Technical capabilities</div>
      <h2>The working stack.</h2>
      <div className="tabs">
        {groups.map((v, k) => (
          <button
            key={v.name}
            aria-pressed={g === k}
            onClick={() => {
              G(k);
              I(0);
            }}
          >
            {v.name}
          </button>
        ))}
      </div>
      <div key={g} className="techs">
        {items.map(([icon], k) => (
          <button key={icon.slug} aria-pressed={i === k} onClick={() => I(k)}>
            <svg viewBox="0 0 24 24">
              <path d={icon.path} />
            </svg>
            {icon.title}
          </button>
        ))}
      </div>
      <p key={items[i][0].slug} className="tech-detail" aria-live="polite">
        {items[i][1]}
      </p>
    </section>
  );
}
