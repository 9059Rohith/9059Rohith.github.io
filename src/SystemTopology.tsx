import { useId, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type Part = [
  name: string,
  layer: string,
  description: string,
  column: number,
  row: number,
];
type Link = [
  from: number,
  to: number,
  payload: string,
  workflow: number,
  step: number,
];
interface MapSpec {
  parts: Part[];
  links: Link[];
}
const maps: Record<string, MapSpec> = {
  udhyogapay: {
    parts: [
      [
        "Customer & worker apps",
        "Client",
        "React clients initiate a booking or checkout and subscribe to room events.",
        0,
        0.3,
      ],
      [
        "Matching caller",
        "Caller",
        "The ranking service accepts candidate profiles and a search request through its independent endpoint.",
        0,
        2.2,
      ],
      [
        "Marketplace API",
        "Express",
        "Booking and payment controllers own state changes.",
        1,
        0,
      ],
      [
        "Socket.IO server",
        "Realtime",
        "The socket service addresses connected customers, workers and admins by room.",
        1,
        1.1,
      ],
      [
        "Matching service",
        "TypeScript",
        "Eligibility filters run before the six-factor scoring algorithm.",
        1,
        2.2,
      ],
      [
        "Marketplace records",
        "MongoDB",
        "Booking and transaction documents retain durable state between sessions.",
        2,
        0,
      ],
      [
        "Payment gateway",
        "Razorpay",
        "The server creates orders and retrieves payment details through the SDK.",
        2,
        1.1,
      ],
    ],
    links: [
      [0, 2, "Booking or checkout request", 1, 0],
      [0, 3, "Room registration and booking events", 3, 0],
      [1, 4, "Search criteria and candidate profiles", 0, 0],
      [2, 5, "Booking state and verified transactions", 2, 3],
      [2, 6, "Order creation and payment lookup", 2, 1],
      [2, 3, "Booking notifications for live rooms", 1, 2],
    ],
  },
  vaakmitra: {
    parts: [
      [
        "Practice client",
        "Client",
        "The learner submits microphone audio and an exercise identifier.",
        0,
        0.2,
      ],
      [
        "Caregiver view",
        "Client",
        "An authenticated reader requests progress or a report.",
        0,
        2.1,
      ],
      [
        "Tamil exercise API",
        "FastAPI",
        "The exercise target determines which evaluation service receives a clip.",
        1,
        0,
      ],
      [
        "Progress & reports",
        "FastAPI",
        "Reads saved attempts and assembles practice history for recommendations.",
        1,
        2.1,
      ],
      [
        "Speech recognition",
        "IndicConformer",
        "Produces a Tamil transcript for supported word and sentence exercises.",
        2,
        0,
      ],
      [
        "Vowel assessment",
        "Acoustic model",
        "Evaluates identity, duration and stability for supported vowel targets.",
        2,
        1,
      ],
      [
        "Attempt records",
        "MongoDB",
        "Stores the learner-scoped result for each request ID.",
        2,
        2,
      ],
      [
        "Learning agents",
        "Python",
        "Turn saved progress into review suggestions, activity recommendations and reporting decisions.",
        2,
        3,
      ],
    ],
    links: [
      [0, 2, "Recorded audio, target and request ID", 0, 1],
      [1, 3, "Learner-scoped progress or report request", 2, 0],
      [2, 4, "Word or sentence recording", 1, 1],
      [2, 5, "Supported vowel target and clip", 3, 0],
      [2, 6, "Scored attempt or unscorable status", 0, 3],
      [3, 6, "Read learner history", 2, 0],
      [3, 7, "Progress snapshot and reporting settings", 2, 2],
    ],
  },
  "life-os": {
    parts: [
      [
        "Owner workspace",
        "React",
        "The owner describes a change, inspects proposals and approves selected actions.",
        0,
        0.6,
      ],
      [
        "Event & review API",
        "FastAPI",
        "Accepts owner-scoped changes and version-specific approval decisions.",
        1,
        0,
      ],
      [
        "Execution engine",
        "Python",
        "Checks the approval, dependencies and execution key before invoking an action.",
        1,
        1.7,
      ],
      [
        "Planner",
        "Python",
        "Turns context into typed proposed actions with explicit arguments.",
        2,
        0,
      ],
      [
        "Provider adapters",
        "Live or simulated",
        "Perform approved changes and read provider state back for verification.",
        2,
        1.25,
      ],
      [
        "Events & audit",
        "SQLAlchemy",
        "Stores event versions, actions and audit evidence under the owner.",
        2,
        2.5,
      ],
    ],
    links: [
      [0, 1, "Change request or selected approval", 0, 0],
      [1, 3, "Context for a versioned proposal", 1, 1],
      [1, 2, "Execution request for reviewed actions", 2, 2],
      [2, 4, "Approved write and read-back", 3, 0],
      [2, 5, "Execution status and verification evidence", 3, 2],
    ],
  },
  skylark: {
    parts: [
      [
        "Conversation UI",
        "Browser",
        "Submits a question and renders typed progress, evidence and answer events.",
        0,
        0,
      ],
      [
        "Next.js proxy",
        "Web server",
        "Keeps the upstream API boundary server-side and relays its response stream.",
        1,
        0,
      ],
      [
        "Chat API",
        "FastAPI",
        "Validates the chat request and exposes the agent through server-sent events.",
        1,
        1.4,
      ],
      [
        "Agent workflow",
        "LangGraph",
        "Chooses clarification or retrieval, then runs cleaning, arithmetic and synthesis.",
        2,
        1.4,
      ],
      [
        "Business boards",
        "monday.com",
        "Deals and Work Orders supply the authorized business records.",
        2,
        0,
      ],
      [
        "Answer synthesis",
        "LLM boundary",
        "Uses the calculated results and quality context to explain the answer.",
        2,
        2.8,
      ],
    ],
    links: [
      [0, 1, "Question and session context", 3, 0],
      [1, 2, "POST /chat and SSE response", 3, 1],
      [2, 3, "Graph invocation and typed events", 3, 2],
      [3, 4, "GraphQL board schema and item queries", 2, 2],
      [3, 5, "Metrics and caveats for explanation", 0, 4],
    ],
  },
};

/** A topology shows calls between deployed or logical components; the adjacent handoff list supplies accessible labels and code-backed drill-downs. */
export default function SystemTopology({
  id,
  onTrace,
}: {
  id: string;
  onTrace: (f: number, s: number) => void;
}) {
  const { parts, links } = maps[id],
    [selected, setSelected] = useState<number | null>(null),
    uid = useId().replaceAll(":", "");
  const related = links
    .map((e, i) => ({ e, i }))
    .filter(
      ({ e }) => selected === null || e[0] === selected || e[1] === selected,
    );
  const pos = (p: Part) => ({ x: 20 + p[3] * 304, y: 18 + p[4] * 94 }),
    W = 195,
    H = 56;
  return (
    <div className="topology">
      <div className="topo-title">
        <div>
          <small>System context</small>
          <h4>How the pieces connect</h4>
        </div>
        {selected !== null && (
          <button onClick={() => setSelected(null)}>
            Show all connections
          </button>
        )}
      </div>
      <div
        className="topo-scroll"
        tabIndex={0}
        role="region"
        aria-label="Scrollable component map"
      >
        <svg
          viewBox={`0 0 835 ${Math.max(...parts.map((p) => pos(p).y)) + H + 19}`}
          className="topo-graph"
          role="group"
          aria-label="System component map"
        >
          <defs>
            <marker
              id={uid}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0L8 4L0 8Z" fill="#637659" />
            </marker>
          </defs>
          {links.map(([a, b, payload], i) => {
            const A = pos(parts[a]),
              B = pos(parts[b]),
              vertical = A.x === B.x,
              down = B.y > A.y;
            const x0 = vertical ? A.x + W / 2 : A.x + W,
              y0 = vertical ? A.y + (down ? H : 0) : A.y + H / 2,
              x1 = vertical ? B.x + W / 2 : B.x,
              y1 = vertical ? B.y + (down ? 0 : H) : B.y + H / 2;
            const route = vertical
              ? `M${x0} ${y0} L${x1} ${y1}`
              : `M${x0} ${y0} C${(x0 + x1) / 2} ${y0},${(x0 + x1) / 2} ${y1},${x1} ${y1}`;
            const m = (x0 + x1) / 2,
              n = (y0 + y1) / 2,
              lit = selected === null || selected === a || selected === b;
            return (
              <g key={payload} opacity={lit ? 1 : 0.19}>
                <title>
                  {parts[a][0]} → {parts[b][0]} · {payload}
                </title>
                <path
                  d={route}
                  fill="none"
                  stroke="#637659"
                  strokeWidth="1.6"
                  markerEnd={"url(#" + uid + ")"}
                />
                <circle cx={m} cy={n} r="9" fill="#f6f6e9" stroke="#8f9a81" />
                <text
                  x={m}
                  y={n + 3.5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#33452e"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
          {parts.map((part, i) => {
            const { x, y } = pos(part);
            return (
              <g
                key={part[0]}
                transform={`translate(${x},${y})`}
                className="topo-part"
                role="button"
                tabIndex={0}
                aria-label={"Inspect " + part[0]}
                aria-pressed={selected === i}
                onClick={() => setSelected(selected === i ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(selected === i ? null : i);
                  }
                }}
              >
                <rect x="0" y="0" width={W} height={H} rx="5" />
                <text x="12" y="20" className="topo-layer">
                  {part[1].toUpperCase()}
                </text>
                <text x="12" y="39" className="topo-name">
                  {part[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mobile-parts" aria-label="Inspect a component">
        {parts.map((p, i) => (
          <button
            key={p[0]}
            aria-pressed={i === selected}
            onClick={() => setSelected(selected === i ? null : i)}
          >
            {p[0]}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="part-note" role="status">
          <strong>{parts[selected][0]}</strong>
          <p>{parts[selected][2]}</p>
        </div>
      )}
      <ol className="connection-key">
        {related.map(({ e: [a, b, payload, f, s], i }) => (
          <li key={i}>
            <button onClick={() => onTrace(f, s)}>
              <i>{i + 1}</i>
              <span>
                <strong>
                  {parts[a][0]} <ArrowRight size={11} /> {parts[b][0]}
                </strong>
                {payload}
              </span>
              <ArrowUpRight size={14} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
