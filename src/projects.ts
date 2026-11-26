export type NodeSpec = [
  name: string,
  tech: string,
  layer: string,
  detail: string,
  input: string,
  output: string,
  file: string,
];
export interface Project {
  id: string;
  name: string;
  repo: string;
  kind: string;
  accent: string;
  intro: string;
  role: string;
  problem: string;
  decision: string;
  tradeoff: string;
  future: string;
  link: string;
  linkLabel: string;
  stack: string[];
  nodes: NodeSpec[];
  flows: [string, number[]][];
}
export const projects: Project[] = [
  {
    id: "udhyogapay",
    name: "UdhyogaPay",
    repo: "UDHYOGAPAY",
    kind: "Realtime marketplace",
    accent: "#f3ab78",
    intro:
      "Find the right worker for a job, then take the booking through chat and payment.",
    role: "Full-stack development and worker matching",
    problem:
      "A nearby worker may lack the requested trade, have no availability, or already carry a heavy workload. Customers need a practical shortlist.",
    decision:
      "Filter on trade, radius and minimum rating before computing six weighted scores. Distance contributes 30% and rating 25%. Each match carries its score breakdown and estimated travel time.",
    tradeoff:
      "Fixed weights make the ranking explainable. They also encode assumptions about what a customer values.",
    future:
      "Evaluate the weights against completed bookings and monitor whether new workers receive a fair share of exposure.",
    link: "/worker-matching.html",
    linkLabel: "Try the matching engine",
    stack: [
      "React",
      "TypeScript",
      "Express",
      "MongoDB",
      "Socket.IO",
      "Razorpay",
    ],
    nodes: [
      [
        "Match request",
        "Express",
        "API",
        "The independent matching endpoint accepts a customer location and candidate list.",
        "Service type, radius, workers",
        "Validated match request",
        "ai_engine/src/index.ts",
      ],
      [
        "Worker ranking",
        "TypeScript",
        "Logic",
        "Compute Haversine distance, apply eligibility filters and rank the remaining workers.",
        "Eligible worker attributes",
        "Ranked candidates and travel estimates",
        "ai_engine/src/algorithms/matchingEngine.ts",
      ],
      [
        "Customer app",
        "React",
        "Client",
        "The web client initiates bookings, payments and chat.",
        "Customer interaction",
        "API requests or socket messages",
        "frontend/package.json",
      ],
      [
        "Booking API",
        "Express",
        "Service",
        "Handle the booking lifecycle and persist changes for customer and worker accounts.",
        "Authenticated booking request",
        "Booking state",
        "backend/src/controllers/bookingController.ts",
      ],
      [
        "Booking store",
        "MongoDB",
        "Data",
        "Mongoose uses MongoDB to persist marketplace records.",
        "Booking document",
        "Stored record or query result",
        "backend/src/config/database.ts",
      ],
      [
        "Payment API",
        "Express",
        "Service",
        "Create orders and check the payment signature before recording the result.",
        "Order request or payment identifiers",
        "Verified transaction status",
        "backend/src/controllers/paymentController.ts",
      ],
      [
        "Razorpay",
        "Payments SDK",
        "Integration",
        "Create gateway orders and retrieve payment details using server-side credentials.",
        "Gateway order parameters",
        "Order ID or gateway response",
        "backend/src/services/razorpayService.ts",
      ],
      [
        "Socket server",
        "Socket.IO",
        "Realtime",
        "Deliver updates to connected clients in the appropriate socket rooms.",
        "Client event",
        "Room event",
        "backend/src/services/socketService.ts",
      ],
      [
        "Chat client",
        "Socket.IO client",
        "Client",
        "Subscribe to the event stream and dispatch updates to the web client.",
        "Incoming socket event",
        "UI event",
        "frontend/src/services/socketService.ts",
      ],
    ],
    flows: [
      ["Worker discovery", [0, 1]],
      ["Booking lifecycle", [2, 3, 4]],
      ["Payment lifecycle", [2, 5, 6, 5]],
      ["Realtime communication", [2, 7, 8]],
    ],
  },
  {
    id: "vaakmitra",
    name: "VaakMitra",
    repo: "ASD-NEW",
    kind: "Speech intelligence",
    accent: "#95d1c5",
    intro:
      "Tamil speech practice with acoustic feedback and a shared view of progress for families and therapists.",
    role: "Speech processing, learning workflows and client development with Team 96",
    problem:
      "A transcript alone cannot show how a child pronounced a vowel. Learners and caregivers also need a record of what was practised across sessions.",
    decision:
      "Use Tamil IndicConformer for transcription and a separate acoustic path for vowel assessment. Seven rule-based learning agents use saved progress to choose review items and summarize practice.",
    tradeoff:
      "Task-specific scoring makes feedback interpretable. Each supported sound and model needs its own validation. Practice scores describe recorded attempts.",
    future:
      "Measure how recording conditions and microphone differences affect scoring across supported sounds.",
    link: "https://ajeya95-researchcopilot.hf.space/",
    linkLabel: "Open speech demo",
    stack: [
      "React",
      "Kotlin",
      "FastAPI",
      "PyTorch",
      "MongoDB",
      "IndicConformer",
    ],
    nodes: [
      [
        "Practice client",
        "React",
        "Client",
        "Capture an attempt and manage the lifecycle of a practice recording.",
        "Microphone audio",
        "Recorded clip",
        "frontend/src/features/vowels/recordingLifecycle.js",
      ],
      [
        "Tamil API",
        "FastAPI",
        "API",
        "Accept a practice attempt, enforce request limits and route it for evaluation.",
        "Audio and target item",
        "Evaluation request",
        "backend/app/routers/tamil.py",
      ],
      [
        "Tamil ASR",
        "IndicConformer",
        "Inference",
        "Load the speech model on demand and transcribe Tamil audio.",
        "Decoded audio",
        "Tamil transcript",
        "backend/app/services/indicconformer.py",
      ],
      [
        "Text assessment",
        "Python",
        "Logic",
        "Compare recognized Tamil text with the exercise target.",
        "Transcript and target",
        "Practice score and feedback",
        "backend/app/services/tamil_validation.py",
      ],
      [
        "Vowel analysis",
        "Acoustic ML",
        "Inference",
        "Analyze vowel recordings through a dedicated acoustic assessment path.",
        "Vowel recording",
        "Acoustic assessment",
        "backend/app/services/vowel_analysis.py",
      ],
      [
        "Progress store",
        "MongoDB",
        "Data",
        "Persist attempts and retrieve learning history through PyMongo.",
        "Practice records",
        "Saved progress",
        "backend/app/database.py",
      ],
      [
        "Learning agents",
        "Python",
        "Orchestration",
        "Use mastery and review history to select work and summarize progress. Report delivery checks caregiver consent.",
        "Saved learning state",
        "Next item and report summary",
        "backend/app/services/tamil_agents.py",
      ],
      [
        "Progress report",
        "FastAPI",
        "API",
        "Deliver learner progress summaries to the application.",
        "Learner history and agent outputs",
        "Report response",
        "backend/app/routers/tamil_reports.py",
      ],
    ],
    flows: [
      ["Audio processing", [0, 1, 2]],
      ["Speech evaluation", [1, 2, 3]],
      ["Tamil learning", [5, 6, 7]],
      ["Acoustic ML", [0, 4]],
    ],
  },
  {
    id: "life-os",
    name: "LIFE-OS",
    repo: "LIFE-OS",
    kind: "Agentic workflows",
    accent: "#a4bfff",
    intro:
      "Turn a schedule change into a reviewable plan across connected apps, then verify what actually happened.",
    role: "Full-stack agent orchestration, approvals and read-back verification",
    problem:
      "Moving a meeting affects calendars and messages. An API success response alone cannot tell the user that every intended change took effect.",
    decision:
      "Bind each approval to an event version and exact action arguments. Read provider state after execution. Uncertain outcomes stay visible for manual review.",
    tradeoff:
      "Explicit approval and additional provider reads add latency. They also give the user a precise record of what ran and what could be confirmed.",
    future:
      "Test partial failures across more provider combinations and improve the recovery experience for uncertain actions.",
    link: "https://ajeya95-llmfleet-sre.hf.space/lifeos/",
    linkLabel: "Open isolated demo",
    stack: [
      "React",
      "Electron",
      "FastAPI",
      "SQLAlchemy",
      "PostgreSQL",
      "Redis",
    ],
    nodes: [
      [
        "Workspace",
        "React",
        "Client",
        "Capture schedule changes and display the proposed actions for review.",
        "User event",
        "Change request",
        "frontend/src/App.tsx",
      ],
      [
        "Event intake",
        "FastAPI",
        "API",
        "Accept workspace events scoped to the authenticated owner.",
        "Change request",
        "Event context",
        "backend/lifeos/main.py",
      ],
      [
        "Plan builder",
        "Python",
        "Logic",
        "Resolve the schedule change into typed actions across supported integrations.",
        "Event context",
        "Versioned action plan",
        "backend/lifeos/planning.py",
      ],
      [
        "Approval gate",
        "Python",
        "Policy",
        "Check whether a reviewed approval still applies to the proposed arguments.",
        "Plan version and approval",
        "Execution permission",
        "backend/lifeos/policy.py",
      ],
      [
        "Executor",
        "Python",
        "Service",
        "Acquire the owner lock and execute approved actions with retry and idempotency safeguards.",
        "Approved actions",
        "Provider result",
        "backend/lifeos/engine.py",
      ],
      [
        "Provider read-back",
        "Provider adapters",
        "Verification",
        "Read back the resulting state. Keep ambiguous outcomes available for review.",
        "Expected state and provider result",
        "Verification outcome",
        "backend/lifeos/engine.py",
      ],
      [
        "Audit store",
        "SQLAlchemy",
        "Data",
        "Persist events and execution evidence. Compose configures PostgreSQL and local settings also support SQLite.",
        "Execution and verification records",
        "Queryable history",
        "backend/lifeos/store.py",
      ],
    ],
    flows: [
      ["Agentic workflow", [0, 1, 2, 3, 4, 5, 6]],
      ["Event lifecycle", [0, 1, 2]],
      ["Approval and execution", [2, 3, 4]],
      ["Verification and audit", [4, 5, 6]],
    ],
  },
  {
    id: "skylark",
    name: "Skylark Signal",
    repo: "skylark",
    kind: "Conversational analytics",
    accent: "#e3cf92",
    intro:
      "Ask a business question and follow the answer back to live deal and work-order records.",
    role: "Data integration, LangGraph orchestration and conversational UI",
    problem:
      "Sales and operations track work in separate boards, with inconsistent dates, amounts and sector labels. A plausible narrative can hide missing rows.",
    decision:
      "Route the question through a LangGraph workflow. Normalize board records and calculate metrics in Python before the language model explains the result.",
    tradeoff:
      "Live reads preserve provenance but inherit upstream latency, permissions and rate limits. The UI surfaces partial-fetch warnings and excluded rows.",
    future:
      "Evaluate ambiguous questions on additional board schemas and measure whether readers notice a partial-data warning.",
    link: "https://ajeya95-llmfleet-sre.hf.space/",
    linkLabel: "Open live workspace",
    stack: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "LangGraph",
      "GraphQL",
      "Python",
    ],
    nodes: [
      [
        "Chat proxy",
        "Next.js",
        "Client boundary",
        "Forward chat requests on the server so provider keys stay out of the browser.",
        "User question",
        "Backend chat request",
        "frontend/app/api/chat/route.ts",
      ],
      [
        "Chat API",
        "FastAPI",
        "API",
        "Validate the request and stream structured progress, sources and answer events.",
        "Message and session ID",
        "Typed response stream",
        "backend/app/main.py",
      ],
      [
        "Intent and plan",
        "LangGraph",
        "Orchestration",
        "Classify the question and choose clarification or a retrieval plan.",
        "Question and session context",
        "Board data requirements",
        "backend/app/agent/graph.py",
      ],
      [
        "Board reader",
        "GraphQL",
        "Integration",
        "Paginate read-only requests to the monday.com Deals and Work Orders boards.",
        "Board IDs and query",
        "Rows and retrieval warnings",
        "backend/app/monday/client.py",
      ],
      [
        "Normalize",
        "Python",
        "Data",
        "Normalize inconsistent fields before arithmetic, retaining evidence of exclusions.",
        "Raw board rows",
        "Comparable records",
        "backend/app/cleaning/normalizer.py",
      ],
      [
        "Analyze",
        "Python",
        "Analytics",
        "Compute the requested metrics and preserve quality information with the result.",
        "Normalized records",
        "Metrics and evidence",
        "backend/app/agent/nodes.py",
      ],
      [
        "Synthesize",
        "LLM",
        "Inference",
        "Turn calculated results into a conversational response with sources and caveats.",
        "Metrics, sources and quality",
        "Narrative and stream events",
        "backend/app/agent/nodes.py",
      ],
    ],
    flows: [
      ["LangGraph workflow", [2, 3, 4, 5, 6]],
      ["BI data pipeline", [3, 4, 5]],
      ["External data integration", [0, 1, 2, 3]],
      ["Streaming response", [5, 6, 1, 0]],
    ],
  },
];
export const github = "https://github.com/9059Rohith";
export const source = (p: Project, n: number) =>
  github + "/" + p.repo + "/blob/main/" + p.nodes[n][6];
