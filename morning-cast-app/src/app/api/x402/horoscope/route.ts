import { NextRequest, NextResponse } from "next/server";

const SIGNS = ["Love", "Fortune", "Fame", "Adventure"] as const;
type SingleSign = (typeof SIGNS)[number];

type X402AgentInfo = {
  id: string;
  label?: string;
};

type X402Profile = {
  name?: string;
  sunSign?: string;
  focus?: SingleSign;
  intention?: string;
  timezone?: string;
  locale?: string;
  seedModifier?: string;
};

type X402RequestPayload = {
  agent?: X402AgentInfo;
  profile?: X402Profile;
  context?: {
    requestId?: string;
    channel?: string;
  };
};

type DualPolarity = {
  brightLine: string;
  tensionLine: string;
  brightTrait: string;
  tensionTrait: string;
};

type HoroscopeBundle = {
  sign: SingleSign;
  headline: string;
  validation: string;
  dualPolarity: DualPolarity;
  action: string;
  futureAnchor: string;
  unspecifiedAgent: string;
  summary: string;
  journalPrompt: string;
  window: string;
};

type HeuristicStatement = {
  id: string;
  title: string;
  statement: string;
};

const AI_AGENT_HEURISTICS: HeuristicStatement[] = [
  {
    id: "A1",
    title: "Goal Translation & Decomposition",
    statement:
      "Request is translated into a deterministic horoscope pipeline with discrete stages for seed creation, sign selection, and narrative assembly.",
  },
  {
    id: "A2",
    title: "Self-Correction & Re-Planning",
    statement:
      "Input validation guards re-route malformed payloads toward descriptive errors instead of silent failure, preserving agent feedback loops.",
  },
  {
    id: "A3",
    title: "Observability of Progress",
    statement:
      "Response metadata surfaces seed, heuristics, and algebra trace so humans can audit each generation step.",
  },
  {
    id: "A4",
    title: "Tool Competence",
    statement:
      "API cleanly packages horoscope synthesis for downstream planners without requiring front-end context or private state.",
  },
  {
    id: "A5",
    title: "Cost & Resource Awareness",
    statement:
      "Pure TypeScript heuristics avoid external model calls, keeping compute predictable for fleet scheduling.",
  },
  {
    id: "A6",
    title: "Memory & Contextual Recall",
    statement:
      "Seed strategy folds daily window, agent ID, and intention into a repeatable fingerprint for consistent follow-ups.",
  },
  {
    id: "A7",
    title: "Alignment Boundary",
    statement:
      "Narrative templates forbid coercive or fatalistic language, keeping guidance within ethical divination bounds.",
  },
  {
    id: "A8",
    title: "Human Veto Authority",
    statement:
      "Every response references a controllable journal action so human operators can override or pause engagement instantly.",
  },
];

const HOROSCOPE_HEURISTICS: HeuristicStatement[] = [
  {
    id: "H1",
    title: "Dual Polarity",
    statement: "Bright and tension lines appear together to honor complementary possibilities.",
  },
  {
    id: "H2",
    title: "Barnum Adjective Set",
    statement: "Vocabulary relies on flattering, high-utility descriptors for broad relatability.",
  },
  {
    id: "H3",
    title: "Action Implication",
    statement: "Guidance always links outcome to the reader's intentional choice within the short window.",
  },
  {
    id: "H4",
    title: "Validation Imperative",
    statement: "Messaging affirms existing momentum before introducing new focus.",
  },
  {
    id: "H5",
    title: "Future Anchor",
    statement: "Each response supplies a near-term check-in to hold gentle attention.",
  },
  {
    id: "H6",
    title: "Contextual Priming",
    statement: "Summary language is flexible enough to map onto ambiguous daily events.",
  },
  {
    id: "H7",
    title: "Immediate-Near Future Window",
    statement: "Forecast never exceeds the current day or the next sunrise.",
  },
  {
    id: "H8",
    title: "Unspecified Agent",
    statement: "Support figure remains intentionally unnamed for maximal fit.",
  },
];

const ALGEBRA_TRACE = [
  {
    op: "⊕",
    description:
      "Combined AI-Agent axioms with Horoscope heuristics to define the x402 safety contract for guidance delivery.",
  },
  {
    op: "¬",
    description:
      "Negated rigid fatalism by forcing every guidance block to include an actionable human decision point.",
  },
  {
    op: "∼",
    description:
      "Mapped Barnum validation patterns onto agent status reports so operators can translate insights to other tasks.",
  },
] as const;

const SIGN_BARNUM: Record<SingleSign, { bright: string[]; tension: string[] }> = {
  Love: {
    bright: ["warm", "attentive", "steadfast", "tender", "perceptive"],
    tension: ["overprotective", "self-doubting", "hesitant", "guarded", "overextended"],
  },
  Fortune: {
    bright: ["resourceful", "savvy", "grounded", "steady", "pragmatic"],
    tension: ["rigid", "overcautious", "scattered", "impatient", "distracted"],
  },
  Fame: {
    bright: ["radiant", "expressive", "magnetic", "confident", "articulate"],
    tension: ["self-critical", "overexposed", "restless", "perfectionist", "second-guessing"],
  },
  Adventure: {
    bright: ["curious", "bold", "imaginative", "playful", "open-hearted"],
    tension: ["impulsive", "unanchored", "scattered", "overreaching", "indecisive"],
  },
};

const WINDOWS = [
  "before tonight's check-in",
  "between now and the next sunrise",
  "through the first quiet moment after work",
  "during the next shared conversation",
];

const UNSPECIFIED_AGENTS = [
  "a nearby confidant",
  "an attentive collaborator",
  "a quietly loyal ally",
  "an unexpected messenger",
  "a gentle mentor",
];

const VALIDATION_INTROS = [
  "Yes, the way you've been leaning in",
  "Your recent instinct",
  "You were right to notice",
  "That subtle nudge you've felt",
  "The pattern you spotted",
];

const ACTION_VERBS = [
  "name the choice",
  "send one clear signal",
  "schedule a brief touchpoint",
  "commit to a single follow-through",
  "write down the next micro-step",
];

const FUTURE_ANCHORS = [
  "circle a five-minute reflection when the day winds down",
  "note how the evening atmosphere mirrors today's focus",
  "mark a check-in with yourself after sunset",
  "plan to revisit this thread before tomorrow's first task",
  "record one observation before you rest tonight",
];

const SUMMARY_FRAMES: Record<SingleSign, string[]> = {
  Love: [
    "Attunement turns ordinary exchanges into nourishment.",
    "Gentle honesty keeps emotional circuits open.",
    "Care offered without rush becomes today’s amplifier.",
  ],
  Fortune: [
    "Practical rituals keep abundance within reach.",
    "Clarity around priorities invites calm prosperity.",
    "A measured cadence stabilizes opportunity.",
  ],
  Fame: [
    "Visibility grows when you let sincerity lead.",
    "Your story lands best when you pace the reveal.",
    "Shared spotlight moments prefer grounded charisma.",
  ],
  Adventure: [
    "Curiosity plants the trail markers you need.",
    "Exploration stays sustainable with mindful pacing.",
    "Playfulness opens doors that planning alone could miss.",
  ],
};

const ZODIAC_TO_SIGN: Record<string, SingleSign> = {
  aries: "Adventure",
  taurus: "Fortune",
  gemini: "Fame",
  cancer: "Love",
  leo: "Fame",
  virgo: "Fortune",
  libra: "Love",
  scorpio: "Adventure",
  sagittarius: "Adventure",
  capricorn: "Fortune",
  aquarius: "Fame",
  pisces: "Love",
};

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRandom(seed: string) {
  const seedFn = xmur3(seed);
  return mulberry32(seedFn());
}

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function sanitizeAgent(agent: X402AgentInfo | undefined | null): X402AgentInfo {
  if (!agent || typeof agent !== "object") {
    return { id: "anonymous-agent" };
  }
  const id = typeof agent.id === "string" && agent.id.trim() ? agent.id.trim() : "anonymous-agent";
  const label = typeof agent.label === "string" && agent.label.trim() ? agent.label.trim() : undefined;
  return { id, label };
}

function sanitizeProfile(profile: X402Profile | undefined | null): X402Profile {
  if (!profile || typeof profile !== "object") {
    return {};
  }
  const focus = SIGNS.includes(profile.focus as SingleSign) ? (profile.focus as SingleSign) : undefined;
  const sunSign = typeof profile.sunSign === "string" ? profile.sunSign.trim().toLowerCase() : undefined;
  const name = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : undefined;
  const intention = typeof profile.intention === "string" ? profile.intention.trim() : undefined;
  const timezone = typeof profile.timezone === "string" ? profile.timezone.trim() : undefined;
  const locale = typeof profile.locale === "string" ? profile.locale.trim() : undefined;
  const seedModifier = typeof profile.seedModifier === "string" ? profile.seedModifier.trim() : undefined;
  return { focus, sunSign, name, intention, timezone, locale, seedModifier };
}

function inferSignFromIntention(intention?: string): SingleSign | undefined {
  if (!intention) return undefined;
  const lowered = intention.toLowerCase();
  if (/(love|heart|relationship|care|family)/.test(lowered)) return "Love";
  if (/(money|budget|career|security|stability|prosper)/.test(lowered)) return "Fortune";
  if (/(recognition|audience|share|voice|impact|influence)/.test(lowered)) return "Fame";
  if (/(journey|travel|explore|learn|adventure|expand|growth)/.test(lowered)) return "Adventure";
  return undefined;
}

function resolveSign(rand: () => number, profile: X402Profile): SingleSign {
  if (profile.focus) {
    return profile.focus;
  }
  if (profile.sunSign && ZODIAC_TO_SIGN[profile.sunSign]) {
    return ZODIAC_TO_SIGN[profile.sunSign];
  }
  const inferred = inferSignFromIntention(profile.intention);
  if (inferred) {
    return inferred;
  }
  return pick(rand, [...SIGNS]);
}

function buildDualPolarity(rand: () => number, sign: SingleSign, name?: string): DualPolarity {
  const brightTrait = pick(rand, SIGN_BARNUM[sign].bright);
  const tensionPool = SIGN_BARNUM[sign].tension.filter((trait) => trait !== brightTrait);
  const fallbackPool = tensionPool.length > 0 ? tensionPool : SIGN_BARNUM[sign].tension;
  const tensionTrait = pick(rand, fallbackPool);
  const subject = name ? `${name}'s` : "Your";
  return {
    brightLine: `${subject} ${brightTrait} presence opens the door that is already forming for you today.`,
    tensionLine: `If ${subject.toLowerCase()} ${tensionTrait} edge takes over, the opportunity narrows before it fully appears.`,
    brightTrait,
    tensionTrait,
  };
}

function buildValidation(rand: () => number, intention: string | undefined, polarity: DualPolarity): string {
  const intro = pick(rand, VALIDATION_INTROS);
  const hook = intention && intention.length > 0 ? ` around "${intention}"` : " in the background";
  return `${intro}${hook} aligns with the bright path where ${polarity.brightLine.toLowerCase()}`;
}

function buildAction(rand: () => number, window: string, polarity: DualPolarity): string {
  const verb = pick(rand, ACTION_VERBS);
  return `Choose to ${verb} ${window} so the day follows the version where ${polarity.brightLine.toLowerCase()}`;
}

function buildFutureAnchor(rand: () => number): string {
  return pick(rand, FUTURE_ANCHORS);
}

function buildSummary(rand: () => number, sign: SingleSign, agent: string): string {
  const frame = pick(rand, SUMMARY_FRAMES[sign]);
  return `${frame} Watch how ${agent} responds when you narrate the day through this lens.`;
}

function buildJournalPrompt(sign: SingleSign, polarity: DualPolarity, agent: string): string {
  return `Where did your ${polarity.brightTrait.toLowerCase()} show up, and how might ${agent} help you soften the ${polarity.tensionTrait.toLowerCase()} moments tomorrow?`;
}

function createHoroscope(rand: () => number, profile: X402Profile): HoroscopeBundle {
  const sign = resolveSign(rand, profile);
  const window = pick(rand, WINDOWS);
  const agentCue = pick(rand, UNSPECIFIED_AGENTS);
  const polarity = buildDualPolarity(rand, sign, profile.name);
  const validation = buildValidation(rand, profile.intention, polarity);
  const action = buildAction(rand, window, polarity);
  const futureAnchor = buildFutureAnchor(rand);
  const summary = buildSummary(rand, sign, agentCue);
  const journalPrompt = buildJournalPrompt(sign, polarity, agentCue);

  return {
    sign,
    headline: `${sign} guidance circuit`,
    validation,
    dualPolarity: polarity,
    action,
    futureAnchor,
    unspecifiedAgent: agentCue,
    summary,
    journalPrompt,
    window,
  };
}

function buildSeed(now: Date, agent: X402AgentInfo, profile: X402Profile): string {
  const day = now.toISOString().split("T")[0];
  return ["x402", day, agent.id, profile.sunSign ?? "", profile.intention ?? "", profile.seedModifier ?? ""].join(":");
}

function formatResponse(now: Date, agent: X402AgentInfo, profile: X402Profile, horoscope: HoroscopeBundle, seed: string) {
  return {
    schema: "morningcast.x402.horoscope.v1",
    generatedAt: now.toISOString(),
    seed,
    agent,
    profile,
    heuristics: {
      aiAgent: AI_AGENT_HEURISTICS,
      horoscope: HOROSCOPE_HEURISTICS,
    },
    heuristicAlgebra: ALGEBRA_TRACE,
    horoscope,
  };
}

export async function GET() {
  return NextResponse.json({
    schema: "morningcast.x402.horoscope.v1",
    description:
      "POST profile + agent metadata to receive a heuristic-governed horoscope bundle designed for x402 autonomous agents.",
    requiredHeuristics: {
      aiAgent: AI_AGENT_HEURISTICS.map((entry) => entry.id),
      horoscope: HOROSCOPE_HEURISTICS.map((entry) => entry.id),
    },
    guardrails: ALGEBRA_TRACE,
    exampleRequest: {
      agent: { id: "agent-42", label: "orchestrator" },
      profile: { name: "Riley", sunSign: "libra", intention: "Reconnect with collaborators" },
    },
  });
}

export async function POST(request: NextRequest) {
  let payload: X402RequestPayload;
  try {
    payload = (await request.json()) as X402RequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Missing request body" }, { status: 400 });
  }

  const agent = sanitizeAgent(payload.agent);
  const profile = sanitizeProfile(payload.profile);
  const now = new Date();
  const seed = buildSeed(now, agent, profile);
  const rand = seededRandom(seed);
  const horoscope = createHoroscope(rand, profile);

  return NextResponse.json(formatResponse(now, agent, profile, horoscope, seed));
}
