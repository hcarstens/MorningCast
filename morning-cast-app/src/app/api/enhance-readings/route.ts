import { NextRequest, NextResponse } from "next/server";
import { callGemini, callGrok, callOpenAI, extractJsonObject, JsonSchemaEnvelope } from "@/lib/ai-clients";

type Divinator = "I Ching" | "Tarot" | "Horoscope";
type SingleSign = "Love" | "Fortune" | "Fame" | "Adventure";

type Reading = {
  divinator: Divinator;
  headline: string;
  flavor: string;
  detail?: string;
  sign: SingleSign;
};

type PipelineDraft = {
  readings: Reading[];
  singleSign: SingleSign;
  journalingIdea: string;
};

type PromptContext = {
  profile: Record<string, unknown>;
  personalizationLabel: string | null;
};

type RequestPayload = {
  profile?: Record<string, unknown>;
  readings?: unknown;
  singleSign?: unknown;
  journalingIdea?: unknown;
  personalizationLabel?: unknown;
};

function isSingleSign(value: unknown): value is SingleSign {
  return value === "Love" || value === "Fortune" || value === "Fame" || value === "Adventure";
}

const PROMPT_HEURISTICS = `Minimal Contract for Coherent AI Output (P1–P5):
P1 Explicit, singular goal.
P2 Defined context and role.
P3 Non-negotiable boundaries.
P4 Output specification.
P5 Grounded authority.

Heuristic Algebra operators:
⊕ Combination — unionize heuristic sets to widen insight.
¬ Transformation — negate a core heuristic to spawn an alternate mode.
∼ Equivalence — translate a heuristic by mapping structural function.

Pipeline intent:
• OpenAI applies ⊕ to blend baseline divinations with Flow heuristics.
• Grok applies ¬ to flip safe tone into a bolder, personable Voice.
• Gemini applies ∼ to mirror insights into fresh, sensory Originality.
All stages must preserve signs, structure, and ethical tone.`;

const RESPONSE_SCHEMA: JsonSchemaEnvelope = {
  name: "HeuristicReadingBlend",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["readings", "singleSign", "journalingIdea"],
    properties: {
      singleSign: {
        type: "string",
        enum: ["Love", "Fortune", "Fame", "Adventure"],
      },
      journalingIdea: { type: "string" },
      readings: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["divinator", "headline", "flavor", "sign"],
          properties: {
            divinator: {
              type: "string",
              enum: ["I Ching", "Tarot", "Horoscope"],
            },
            headline: { type: "string" },
            flavor: { type: "string" },
            detail: { type: "string" },
            sign: {
              type: "string",
              enum: ["Love", "Fortune", "Fame", "Adventure"],
            },
          },
        },
      },
    },
  },
};

function isReading(candidate: unknown): candidate is Reading {
  return (
    candidate !== null &&
    candidate !== undefined &&
    typeof candidate === "object" &&
    (candidate as Reading).divinator !== undefined &&
    ((candidate as Reading).divinator === "I Ching" ||
      (candidate as Reading).divinator === "Tarot" ||
      (candidate as Reading).divinator === "Horoscope") &&
    typeof (candidate as Reading).headline === "string" &&
    typeof (candidate as Reading).flavor === "string" &&
    isSingleSign((candidate as Reading).sign)
  );
}

function sanitizeDraft(candidate: unknown, fallback: PipelineDraft): PipelineDraft {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }
  const draft = candidate as Partial<PipelineDraft>;
  const readings = Array.isArray(draft.readings)
    ? draft.readings.filter(isReading).map((entry, index) => ({
        divinator: entry.divinator,
        headline: entry.headline.trim() || fallback.readings[index]?.headline || entry.headline,
        flavor: entry.flavor.trim() || fallback.readings[index]?.flavor || entry.flavor,
        detail: entry.detail?.toString().trim() || fallback.readings[index]?.detail,
        sign: entry.sign,
      }))
    : fallback.readings;

  const trimmedReadings = readings.length === fallback.readings.length ? readings : fallback.readings;
  const singleSign =
    draft.singleSign === "Love" ||
    draft.singleSign === "Fortune" ||
    draft.singleSign === "Fame" ||
    draft.singleSign === "Adventure"
      ? draft.singleSign
      : fallback.singleSign;
  const journalingIdea = typeof draft.journalingIdea === "string" && draft.journalingIdea.trim()
    ? draft.journalingIdea.trim()
    : fallback.journalingIdea;

  return {
    readings: trimmedReadings,
    singleSign,
    journalingIdea,
  };
}

function buildOpenAiPrompt(context: PromptContext, base: PipelineDraft): string {
  return `Baseline divinations (Flow focus stage):
${JSON.stringify({ profile: context.profile, personalizationLabel: context.personalizationLabel, base }, null, 2)}

Task: Use ⊕ to braid the baseline readings into a smoother, sequential narrative. Keep each sign identical, respect safety, and limit each flavor+detail bundle to under 90 words. Return JSON matching the schema.`;
}

function buildGrokPrompt(context: PromptContext, base: PipelineDraft, flowDraft: PipelineDraft): string {
  return `You have the baseline readings and the Flow draft from OpenAI.
${JSON.stringify({ profile: context.profile, personalizationLabel: context.personalizationLabel, base, flowDraft }, null, 2)}

Apply ¬ to flip cautious tone into confident, witty Voice while keeping alignment boundaries. Preserve structure, signs, and Flow transitions. Return JSON in the schema.`;
}

function buildGeminiPrompt(
  context: PromptContext,
  base: PipelineDraft,
  flowDraft?: PipelineDraft,
  voiceDraft?: PipelineDraft
): string {
  if (!flowDraft && !voiceDraft) {
    // Initial Gemini call (default LLM)
    return `Baseline divinations (Originality focus stage):
${JSON.stringify({ profile: context.profile, personalizationLabel: context.personalizationLabel, base }, null, 2)}

Apply ∼ to translate the insights into vivid, sensory Originality. Keep each sign identical, respect safety, and limit each flavor+detail bundle to under 90 words. Return JSON matching the schema.`;
  }

  return `You have baseline, Flow-optimized, and Voice-energized readings.
${JSON.stringify(
    { profile: context.profile, personalizationLabel: context.personalizationLabel, base, flowDraft, voiceDraft },
    null,
    2
  )}

Apply ∼ to translate the insights into vivid, sensory Originality. Add one sentence in each detail that references how Flow (OpenAI), Voice (Grok), and Originality (Gemini) collaborate. Keep the schema, signs, and safety constraints intact. Return JSON.`;
}

export async function POST(request: NextRequest) {
  let payload: RequestPayload;
  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!Array.isArray(payload.readings) || payload.readings.length === 0) {
    return NextResponse.json({ error: "Missing readings" }, { status: 400 });
  }

  const readingsInput = payload.readings as unknown[];
  const sanitizedBase = readingsInput.filter(isReading);
  if (sanitizedBase.length !== readingsInput.length) {
    return NextResponse.json({ error: "Malformed readings" }, { status: 400 });
  }

  if (!isSingleSign(payload.singleSign)) {
    return NextResponse.json({ error: "Invalid single sign" }, { status: 400 });
  }

  if (typeof payload.journalingIdea !== "string") {
    return NextResponse.json({ error: "Invalid journaling idea" }, { status: 400 });
  }

  const profile = payload.profile && typeof payload.profile === "object" && payload.profile !== null ? payload.profile : {};
  const personalizationLabel =
    typeof payload.personalizationLabel === "string" && payload.personalizationLabel.trim()
      ? payload.personalizationLabel.trim()
      : null;

  const baseDraft: PipelineDraft = {
    readings: sanitizedBase.map((entry) => ({
      divinator: entry.divinator,
      headline: entry.headline.trim(),
      flavor: entry.flavor.trim(),
      detail: entry.detail?.toString().trim() || undefined,
      sign: entry.sign,
    })),
    singleSign: payload.singleSign,
    journalingIdea: payload.journalingIdea.trim(),
  };

  const promptContext: PromptContext = {
    profile: profile as Record<string, unknown>,
    personalizationLabel,
  };

  let workingDraft: PipelineDraft = baseDraft;
  const modelsUsed: string[] = [];

  // Try Gemini first (default LLM)
  try {
    const gemini = await callGemini({
      systemPrompt: PROMPT_HEURISTICS,
      userPrompt: buildGeminiPrompt(promptContext, baseDraft),
    });
    if (gemini) {
      const parsed = sanitizeDraft(extractJsonObject(gemini.content), workingDraft);
      workingDraft = parsed;
      modelsUsed.push(`gemini:${gemini.model}`);
    }
  } catch (error) {
    console.error("Gemini enhancement error", error);
  }

  const originalityDraft = workingDraft;

  // Try OpenAI for Flow optimization
  try {
    const openAi = await callOpenAI({
      systemPrompt: PROMPT_HEURISTICS,
      userPrompt: buildOpenAiPrompt(promptContext, baseDraft),
      schema: RESPONSE_SCHEMA,
    });
    if (openAi) {
      const parsed = sanitizeDraft(extractJsonObject(openAi.content), workingDraft);
      workingDraft = parsed;
      modelsUsed.push(`openai:${openAi.model}`);
    }
  } catch (error) {
    console.error("OpenAI enhancement error", error);
  }

  const flowDraft = workingDraft;

  // Try Grok for Voice enhancement
  try {
    const grok = await callGrok({
      systemPrompt: PROMPT_HEURISTICS,
      userPrompt: buildGrokPrompt(promptContext, baseDraft, flowDraft),
    });
    if (grok) {
      const parsed = sanitizeDraft(extractJsonObject(grok.content), workingDraft);
      workingDraft = parsed;
      modelsUsed.push(`grok:${grok.model}`);
    }
  } catch (error) {
    console.error("Grok enhancement error", error);
  }

  return NextResponse.json({
    readings: workingDraft.readings,
    singleSign: workingDraft.singleSign,
    journalingIdea: workingDraft.journalingIdea,
    models: modelsUsed,
  });
}
