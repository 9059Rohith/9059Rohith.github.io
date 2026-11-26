/** A handoff describes the value available to the next stage. References point to the reviewed source revision. */
export type Stage = [
  component: string,
  action: string,
  explanation: string,
  handoff: string,
  file: string,
  line: number,
];
export interface Pathway {
  name: string;
  question: string;
  input: string;
  result: string;
  exception: string;
  steps: Stage[];
}
export interface Design {
  revision: string;
  summary: string;
  people: string;
  boundary: string;
  storage: string;
  reason: string;
  flows: Pathway[];
}

const matchApi = "ai_engine/src/index.ts",
  ranking = "ai_engine/src/algorithms/matchingEngine.ts",
  booking = "backend/src/controllers/bookingController.ts",
  payment = "backend/src/controllers/paymentController.ts",
  gateway = "backend/src/services/razorpayService.ts",
  clientSocket = "frontend/src/services/socketService.ts",
  serverSocket = "backend/src/services/socketService.ts";
const tamil = "backend/app/routers/tamil.py",
  vowel = "backend/app/services/vowel_analysis.py",
  asr = "backend/app/services/indicconformer.py",
  agents = "backend/app/services/tamil_agents.py";
const engine = "backend/lifeos/engine.py",
  lifeApi = "backend/lifeos/main.py",
  planning = "backend/lifeos/planning.py",
  policy = "backend/lifeos/policy.py",
  store = "backend/lifeos/store.py";
const graph = "backend/app/agent/graph.py",
  nodes = "backend/app/agent/nodes.py",
  monday = "backend/app/monday/client.py",
  normal = "backend/app/cleaning/normalizer.py",
  proxy = "frontend/app/api/chat/route.ts",
  chat = "backend/app/main.py";

export const designs: Record<string, Design> = {
  udhyogapay: {
    revision: "77fe130c7941cb5b7d580b6e46ea3fff6e86a4e1",
    summary:
      "A customer needs two things from this marketplace: a shortlist of suitable workers and a reliable record after hiring one. A TypeScript service handles ranking. The Express backend owns bookings and payments, while Socket.IO delivers live updates.",
    people: "Customer, worker and marketplace operator",
    boundary: "React clients → Express services → Razorpay",
    storage:
      "MongoDB stores bookings and transactions. The independent matching endpoint ranks a supplied candidate list.",
    reason:
      "Keeping the score breakdown alongside each candidate lets a customer distinguish a shorter journey from a stronger skills match.",
    flows: [
      {
        name: "Worker discovery",
        question: "How does a repair request become a ranked shortlist?",
        input:
          "An electrical repair near the customer, a search radius and candidate worker profiles.",
        result:
          "The caller receives up to ten candidates with scores, distances and travel estimates.",
        exception:
          "The endpoint returns HTTP 400 if the request or worker list is missing. A search can legitimately return zero eligible workers.",
        steps: [
          [
            "Express endpoint",
            "Accept the search",
            "POST /api/match reads the request and candidate list from the body. The customer location is the origin for each distance calculation.",
            "Search criteria and candidates",
            matchApi,
            32,
          ],
          [
            "Matching engine",
            "Filter for eligibility",
            "Calculate distance and check profession, maximum radius and minimum rating. Only surviving candidates enter scoring.",
            "Eligible worker profiles",
            ranking,
            16,
          ],
          [
            "Six-factor ranker",
            "Explain the order",
            "Combine distance, rating, experience, availability, skills and workload. Distance carries 30% and rating carries 25%. The result includes the individual scores.",
            "Ranked matches with score breakdowns",
            ranking,
            77,
          ],
          [
            "Express endpoint",
            "Return the shortlist",
            "Apply the urgency filter when requested and take the top ten. The response includes a timestamp and the matching result.",
            "Shortlist returned to the caller",
            matchApi,
            47,
          ],
        ],
      },
      {
        name: "Booking lifecycle",
        question: "What happens after a customer chooses a worker?",
        input:
          "A customer selects a worker, service and location in the booking UI.",
        result:
          "Customer and worker can retrieve the booking and its current status after returning to the app.",
        exception:
          "A worker can reject a pending booking. The controller records the rejection and returns that worker to available status.",
        steps: [
          [
            "React booking client",
            "Submit the booking",
            "The client service packages the booking details and sends an HTTP request to the backend.",
            "Customer’s booking request",
            "frontend/src/services/bookingService.ts",
            8,
          ],
          [
            "Booking controller",
            "Reserve the job",
            "The backend checks the worker, calculates pricing and creates a booking with a start code. It marks the worker busy and emits a booking request.",
            "Persisted booking and worker notification",
            booking,
            96,
          ],
          [
            "Worker acceptance",
            "Confirm the assignment",
            "The accept handler checks who owns the assignment, changes the booking to accepted and notifies the customer.",
            "Accepted booking",
            booking,
            150,
          ],
          [
            "Job lifecycle",
            "Record the work",
            "The OTP start handler validates the code before changing the status. On completion, the controller saves the completed state and frees the worker.",
            "Completion record and available worker",
            booking,
            364,
          ],
        ],
      },
      {
        name: "Payment lifecycle",
        question: "How does a checkout result become a paid booking?",
        input:
          "An eligible booking and a customer asking to pay its outstanding amount.",
        result:
          "The transaction has a verification timestamp and the corresponding booking shows its payment status.",
        exception:
          "An invalid signature marks the transaction failed and returns HTTP 400. A gateway detail lookup failure exits before the success update.",
        steps: [
          [
            "Payment controller",
            "Price the order",
            "The server loads the booking and converts the payable amount into paise before requesting a gateway order.",
            "Amount in paise and booking reference",
            payment,
            61,
          ],
          [
            "Razorpay adapter",
            "Create the gateway order",
            "The adapter creates the order through the server-side SDK. The controller saves a transaction referencing the gateway order for checkout.",
            "Gateway order ID",
            gateway,
            28,
          ],
          [
            "Verification handler",
            "Check the checkout proof",
            "After checkout, the handler checks the order ID, payment ID and signature, then retrieves payment details from Razorpay.",
            "Validated payment details",
            payment,
            147,
          ],
          [
            "MongoDB update",
            "Record payment",
            "The controller updates the transaction by gateway order ID, then updates the booking. These are two writes, so each lookup has its own failure path.",
            "Successful transaction and paid booking",
            payment,
            180,
          ],
        ],
      },
      {
        name: "Realtime communication",
        question: "How does a customer learn that a worker accepted?",
        input:
          "A connected worker accepts a booking while the customer is online.",
        result:
          "The customer receives the acceptance details and the admin room receives a booking-status update.",
        exception:
          "Room events reach connected clients. The booking lookup is the separate path for retrieving persisted status after a disconnect.",
        steps: [
          [
            "Client socket",
            "Join the correct room",
            "The customer client emits its online event. The server associates the live connection with the customer room.",
            "Customer room subscription",
            clientSocket,
            47,
          ],
          [
            "Worker socket",
            "Publish acceptance",
            "The worker client emits a booking:accept event with details identifying the customer and the job.",
            "Acceptance event",
            clientSocket,
            85,
          ],
          [
            "Socket.IO server",
            "Address the notification",
            "The server targets the user room with booking:accepted and publishes a separate booking:status event to the admin room.",
            "Room-scoped booking update",
            serverSocket,
            71,
          ],
          [
            "Client listener",
            "Deliver the live update",
            "The client service exposes event subscriptions and cleanup. A subscribed UI can update immediately while a later booking lookup reads durable state.",
            "Update available to subscribed UI",
            clientSocket,
            113,
          ],
        ],
      },
    ],
  },
  vaakmitra: {
    revision: "553e18ef10d416de60f253e56a3963e7ea0a4a36",
    summary:
      "A learner records a Tamil exercise. FastAPI identifies the target, checks the audio and selects a scoring path. MongoDB retains each attempt so later recommendations and caregiver reports can use the learner’s history.",
    people: "Learner, caregiver and therapist",
    boundary: "Practice client → FastAPI → speech models and learning services",
    storage:
      "Each stored attempt is scoped to the learner. A stable request ID lets the backend recognize a retried upload.",
    reason:
      "Words and sentences can be compared as text. A sustained vowel also needs acoustic evidence of identity, duration and stability.",
    flows: [
      {
        name: "Audio processing",
        question: "How does a recording become one saved practice attempt?",
        input:
          "A learner records an exercise and submits the clip with the item ID and request ID.",
        result:
          "The learner receives the measured result and an updated progress summary.",
        exception:
          "Unknown items, empty clips, unsupported file types and oversized uploads have distinct rejection paths. Retrying the same saved attempt returns the existing result.",
        steps: [
          [
            "Recording client",
            "Capture an attempt",
            "The recording lifecycle manages microphone access, capture state and resource cleanup so the UI can submit a finished clip.",
            "Captured audio",
            "frontend/src/features/vowels/recordingLifecycle.js",
            73,
          ],
          [
            "Tamil API",
            "Identify and validate",
            "POST /api/tamil/evaluate resolves the exercise, looks for an earlier attempt and checks the actual upload size and content type.",
            "Accepted clip with target",
            tamil,
            398,
          ],
          [
            "Evaluation router",
            "Select a scorer",
            "The item kind selects a word/sentence transcript comparison or a sound-specific acoustic evaluator. The expensive evaluation runs off the request event loop.",
            "Measured result and feedback",
            tamil,
            67,
          ],
          [
            "Attempt store",
            "Save and respond",
            "The handler derives the attempt ID from the learner and request ID. It stores the allowed result fields and returns the attempt with recalculated progress.",
            "Saved attempt and learner progress",
            tamil,
            399,
          ],
        ],
      },
      {
        name: "Speech evaluation",
        question: "How is a spoken Tamil word checked against the exercise?",
        input:
          "A word or sentence target and a recording, with an optional browser transcript.",
        result:
          "The response records how the text was evaluated and returns educational feedback for that item.",
        exception:
          "If the server speech model is unavailable, the router can fall back to acoustic evaluation. The evaluation source matters when interpreting the feedback.",
        steps: [
          [
            "Item router",
            "Choose the transcript path",
            "For a word or sentence, a supplied browser transcript can be used when acoustic checks find speech. Without a usable browser transcript the server attempts recognition.",
            "Audio for recognition or checked browser text",
            tamil,
            67,
          ],
          [
            "IndicConformer",
            "Transcribe the clip",
            "On the server recognition path, the service prepares the waveform and invokes the configured Tamil ASR model. Its output is recognized text.",
            "Recognized Tamil text",
            asr,
            152,
          ],
          [
            "Text assessment",
            "Compare with the target",
            "The validator normalizes text, compares it with the expected exercise and uses the comparison to produce a matched or missed result.",
            "Text similarity and practice feedback",
            "backend/app/services/tamil_validation.py",
            49,
          ],
        ],
      },
      {
        name: "Tamil learning",
        question: "How does practice history determine what to review next?",
        input:
          "A signed-in learner requests insights after several practice sessions.",
        result:
          "The response includes suggested learning and practice items, game and speech guidance, analytics and a report summary.",
        exception:
          "The integration agent checks enablement, consent and provider readiness. Generating a summary and delivering it externally are separate operations.",
        steps: [
          [
            "Progress query",
            "Rebuild learning history",
            "The API reads the learner’s records and groups attempts into mastery, recent activity and review-due items.",
            "Learner-specific progress snapshot",
            tamil,
            121,
          ],
          [
            "Insights endpoint",
            "Gather report settings",
            "The insights route combines saved progress with report configuration and delivery readiness before calling the pipeline.",
            "Progress and reporting context",
            tamil,
            388,
          ],
          [
            "Learning pipeline",
            "Choose the next activity",
            "Seven rule-based agents produce learning, practice, game, speech, analytics, report and integration outputs. One trace ID groups their results.",
            "Recommendations and report summary",
            agents,
            108,
          ],
          [
            "Delivery policy",
            "Check consent",
            "The integration agent evaluates the report settings and provider readiness and returns a delivery decision alongside the recommendations.",
            "Integration decision",
            agents,
            100,
          ],
        ],
      },
      {
        name: "Acoustic ML",
        question:
          "How does the system distinguish a short vowel from a long one?",
        input:
          "A supported paired Tamil vowel and a clip containing a sustained sound.",
        result:
          "The learner receives vowel-identity and duration feedback, or a reason the clip could not be scored.",
        exception:
          "If the vowel identity changes across the recording, the evaluator can return an unstable-vowel result and ask for a steadier attempt.",
        steps: [
          [
            "Target routing",
            "Dispatch the vowel",
            "The router sends supported paired vowels to the acoustic vowel analyzer. Diphthongs have a dedicated analysis path.",
            "Audio bytes and expected vowel",
            tamil,
            52,
          ],
          [
            "Feature extraction",
            "Locate voiced speech",
            "The extractor measures activity and builds acoustic features across the voiced interval, including measurements across thirds of the recording.",
            "Identity features and voiced duration",
            vowel,
            71,
          ],
          [
            "Identity classifier",
            "Estimate the vowel",
            "The model estimates identity probabilities. The evaluator checks confidence and compares predictions across thirds to detect instability.",
            "Predicted identity and stability evidence",
            vowel,
            272,
          ],
          [
            "Duration check",
            "Compare sound and length",
            "The evaluator applies its one-second voiced-duration rule and checks identity and length against the target. Both affect the practice feedback.",
            "Educational score and specific feedback",
            vowel,
            277,
          ],
        ],
      },
    ],
  },

  "life-os": {
    revision: "d8b5990d6554b62dced0ff1bc57e919af0fe518f",
    summary:
      "A schedule change becomes a proposed set of actions across connected apps. LIFE-OS keeps planning, permission to write, provider execution and verification as separate stages. The user can inspect the evidence for each action.",
    people: "Workspace owner reviewing changes across apps",
    boundary: "React workspace → FastAPI engine → provider adapters",
    storage:
      "The SQLAlchemy document store retains owner-scoped events and audit entries. The hosted demo simulates provider actions.",
    reason:
      "An accepted API request and a confirmed change are different pieces of evidence. The engine retains both so an uncertain delivery can be investigated safely.",
    flows: [
      {
        name: "Agentic workflow",
        question: "What happens when a meeting needs to move?",
        input:
          "A workspace owner reports a schedule change that may affect a meeting and a follow-up message.",
        result:
          "The owner sees which proposed changes were approved, executed and verified, and which still need attention.",
        exception:
          "A rejected action or failed dependency can block dependent actions. The event summary can contain a mixture of outcomes.",
        steps: [
          [
            "Event intake",
            "Capture the change",
            "The authenticated events endpoint gives the current owner and incoming event to the engine. The source and simulation mode travel with the event.",
            "Owner-scoped schedule event",
            lifeApi,
            262,
          ],
          [
            "Planner",
            "Construct a proposal",
            "The engine gathers context and invokes planning logic. A proposed action records its target, arguments and dependencies so a person can review the intended change.",
            "Versioned plan of actions",
            engine,
            115,
          ],
          [
            "Approval gate",
            "Record the decision",
            "The engine records approval for selected actions against the event version and argument digest. Editing a plan can invalidate that decision.",
            "Approval for specific actions",
            engine,
            289,
          ],
          [
            "Execution engine",
            "Apply permitted changes",
            "The engine checks dependencies and permission before calling a provider or its simulation. An execution key identifies this particular write.",
            "Provider result for an action",
            engine,
            440,
          ],
          [
            "Verification and audit",
            "Report what took effect",
            "The engine checks resulting state, records the evidence and summarizes verified, failed, blocked and uncertain actions individually.",
            "Per-action result and audit history",
            engine,
            356,
          ],
        ],
      },
      {
        name: "Event lifecycle",
        question:
          "How does a change become a reviewable event in the workspace?",
        input: "A user submits a schedule change from the workspace.",
        result:
          "The event has an owner, a saved plan and a stream the interface can use to follow updates.",
        exception:
          "Event reads are scoped to the owner. A new plan version requires the approval checks to run against the revised arguments.",
        steps: [
          [
            "FastAPI intake",
            "Accept an event",
            "POST /api/events passes the request into the planning engine under the authenticated owner.",
            "Event text, owner and source",
            lifeApi,
            262,
          ],
          [
            "Context and planning",
            "Identify affected records",
            "Planning extracts scheduling information and evaluates candidate meetings. Candidate selection gives the plan concrete entities to act on.",
            "Proposed calendar and follow-up actions",
            planning,
            187,
          ],
          [
            "Event store",
            "Persist the draft",
            "The engine saves the event under the owner. Later operations use its ID and version to find the same draft.",
            "Stored event and version",
            engine,
            57,
          ],
          [
            "Workspace stream",
            "Show updates",
            "The event stream endpoint exposes changes for a specific event so the workspace can track its progress through review and execution.",
            "Event updates for the workspace",
            lifeApi,
            272,
          ],
        ],
      },
      {
        name: "Approval and execution",
        question:
          "What prevents an edited action from using an earlier approval?",
        input: "A user approves one version of a proposed calendar change.",
        result:
          "Only an action with current approval and satisfied dependencies is eligible for its provider call.",
        exception:
          "A version mismatch, changed argument hash or expired approval fails validation. An uncertain previous delivery blocks automatic re-execution.",
        steps: [
          [
            "Review endpoint",
            "Accept selected actions",
            "The approve endpoint sends the chosen IDs and expected event version to the engine.",
            "Reviewed action IDs and version",
            lifeApi,
            341,
          ],
          [
            "Approval record",
            "Bind the arguments",
            "The approval record attaches permission to the reviewed action. The argument digest identifies the exact parameters being approved.",
            "Versioned, expiring approval",
            engine,
            289,
          ],
          [
            "Policy check",
            "Recheck before writing",
            "The policy compares the event version and argument hash with the approval claims and checks expiry. The executor consults this validation before a write.",
            "Current execution permission",
            policy,
            36,
          ],
          [
            "Executor",
            "Run the approved action",
            "The execution key includes the owner, event, action, version and argument hash. Dependencies and existing execution records determine whether work can proceed.",
            "Provider result or explicit blocked state",
            engine,
            440,
          ],
        ],
      },
      {
        name: "Verification and audit",
        question:
          "What if a provider times out after it may already have written?",
        input:
          "An executed action has a provider result or an ambiguous delivery outcome.",
        result:
          "The event carries a verification status and a history that an owner can inspect before deciding how to recover.",
        exception:
          "Read-only reconciliation can resolve uncertainty if evidence becomes available. An uncertain write is held for review to avoid duplicating its effect.",
        steps: [
          [
            "Execution engine",
            "Classify the outcome",
            "The engine records the write result and attempts to verify the actual state. A missing confirmation can leave the action uncertain.",
            "Provider result and expected state",
            engine,
            440,
          ],
          [
            "Reconciliation",
            "Read back the provider",
            "For an eligible uncertain action, reconciliation checks provider state again without issuing the original write. Matching evidence can move it to verified.",
            "Verification evidence",
            engine,
            380,
          ],
          [
            "Audit store",
            "Keep the evidence",
            "The engine logs stage changes, and the SQLAlchemy store appends audit entries. This preserves the order of decisions and results.",
            "Owner-scoped audit trail",
            store,
            179,
          ],
        ],
      },
    ],
  },
  skylark: {
    revision: "d6c24b2b5a7072d5611be240e81baa6950980d83",
    summary:
      "A business user asks a question about sales or operations. A LangGraph workflow chooses the necessary monday.com records, normalizes them and calculates the answer in Python. The chat interface receives both the explanation and evidence about the data behind it.",
    people: "Business operator asking about deals or work orders",
    boundary: "Next.js chat proxy → FastAPI → LangGraph → monday.com",
    storage:
      "Business records live on monday.com boards. The agent runner uses a session checkpointer for conversational context.",
    reason:
      "Separating arithmetic from text generation makes it possible to inspect which records contributed to a result and carry exclusions into its explanation.",
    flows: [
      {
        name: "LangGraph workflow",
        question:
          "How does a pipeline question become an answer with evidence?",
        input:
          "A founder asks about the Energy sales pipeline for the quarter.",
        result:
          "The chat receives an explanation backed by calculated metrics, sources and applicable caveats.",
        exception:
          "When the intent is ambiguous, the graph takes the clarify branch and finishes that turn before fetching board records.",
        steps: [
          [
            "Intent parser",
            "Interpret the question",
            "The graph begins at parse_intent. A conditional edge chooses clarification or a plan for the data the question needs.",
            "Intent or clarification request",
            graph,
            63,
          ],
          [
            "Data planner",
            "Choose the boards",
            "The planner identifies the records required for the question. The fetch node uses the board schema and calls the source adapter.",
            "Required board records",
            nodes,
            398,
          ],
          [
            "Cleaning stage",
            "Normalize records",
            "The cleaning node maps the fetched fields into comparable records and carries information about missing or unusable values.",
            "Normalized records with quality context",
            nodes,
            497,
          ],
          [
            "Python analysis",
            "Calculate the metric",
            "The analysis node applies scope and metric logic. Structured results carry the inputs the response layer needs to explain the figure.",
            "Calculated metrics",
            nodes,
            542,
          ],
          [
            "Synthesis",
            "Compose the response",
            "The synthesis and formatting nodes turn structured results into an answer. The streaming runner emits sources and caveats when available.",
            "Answer with evidence",
            nodes,
            599,
          ],
        ],
      },
      {
        name: "BI data pipeline",
        question:
          "Which records can contribute to a quarter’s pipeline figure?",
        input:
          "Deal rows with inconsistent sector labels, currency fields and date formats.",
        result:
          "Comparable deals contribute to the scoped metric, with evidence about exclusions maintained alongside the answer.",
        exception:
          "Missing or unparseable values can exclude records from a calculation. Quality caveats carry that limitation into the result.",
        steps: [
          [
            "Board reader",
            "Retrieve source rows",
            "The adapter reads board items through paginated GraphQL queries. Item and column values arrive in the source board’s representation.",
            "Raw items and source column values",
            monday,
            367,
          ],
          [
            "Normalizer",
            "Interpret typed values",
            "The normalizer handles currency formats, dates, sectors and deal stages. Invalid values can be identified before arithmetic.",
            "Normalized values and data-quality flags",
            normal,
            78,
          ],
          [
            "Scope filter",
            "Apply period and sector",
            "Period and sector filters select records that belong in this question. The analysis layer retains exclusion counts for the scoped data.",
            "Eligible records for the requested scope",
            nodes,
            196,
          ],
          [
            "Metric calculation",
            "Produce the result",
            "The analysis node calculates the requested business metric and passes it forward with source and quality information.",
            "Structured result for synthesis",
            nodes,
            542,
          ],
        ],
      },
      {
        name: "External data integration",
        question: "How does a question reach a changing monday.com board?",
        input:
          "A retrieval plan names the source boards needed for this question.",
        result:
          "The analysis receives board rows mapped to business fields with provenance and available fetch warnings.",
        exception:
          "The client distinguishes rate limits and transient server failures from permanent errors. Retry delays are bounded, and an incomplete read can produce a caveat.",
        steps: [
          [
            "Fetch node",
            "Resolve the source",
            "The workflow asks the adapter for the relevant board structure and records. Source-specific access stays inside this boundary.",
            "Board and field requirements",
            nodes,
            410,
          ],
          [
            "GraphQL schema",
            "Map live columns",
            "The adapter reads the source schema. The agent maps column titles and aliases to the semantic fields expected by the analysis.",
            "Mapping from board columns to fields",
            nodes,
            80,
          ],
          [
            "GraphQL pagination",
            "Follow item cursors",
            "The adapter fetches the first page and follows continuation cursors within its page limits. Transport and upstream API errors have explicit handling.",
            "Source rows and retrieval status",
            monday,
            367,
          ],
          [
            "Fetch node",
            "Attach provenance",
            "Results and source information return to graph state so later stages can qualify a partial answer and identify the board it came from.",
            "Data and source context for analysis",
            nodes,
            410,
          ],
        ],
      },
      {
        name: "Streaming response",
        question:
          "How can the UI show progress, evidence and a final answer separately?",
        input: "A question and session ID arrive at the web application.",
        result:
          "The browser can show progress, response text, data sources and completion as distinct events.",
        exception:
          "A typed error event can end the stream. If execution fails after a partial read, the runner can still surface available sources and caveats.",
        steps: [
          [
            "Next.js proxy",
            "Open the request",
            "The server route forwards the request to the backend /chat endpoint, requests a text/event-stream response and relays the upstream body.",
            "Backend chat request",
            proxy,
            21,
          ],
          [
            "FastAPI endpoint",
            "Start streaming",
            "The chat route validates the request and encodes agent events as server-sent events. This keeps a single request open during graph execution.",
            "Open SSE response",
            chat,
            106,
          ],
          [
            "Agent runner",
            "Emit typed events",
            "As the graph progresses, the runner emits status changes, synthesis tokens, source and caveat updates, followed by a completion or error event.",
            "Typed events in the stream",
            graph,
            155,
          ],
          [
            "Browser parser",
            "Reassemble events",
            "The SSE parser buffers chunks until an event is complete and validates the event payload. The interface can update each part of the conversation independently.",
            "Structured updates for the chat UI",
            "frontend/lib/sse.ts",
            79,
          ],
        ],
      },
    ],
  },
};
