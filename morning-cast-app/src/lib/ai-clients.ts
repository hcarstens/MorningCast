export interface JsonSchemaEnvelope {
  name: string;
  schema: Record<string, unknown>;
}

function ensureJsonContent(raw: string): string {
  const fenced = raw.trim();
  const fenceMatch = fenced.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return fenced;
}

export function extractJsonObject(raw: string): unknown {
  const cleaned = ensureJsonContent(raw);
  const bracketMatch = cleaned.match(/\{[\s\S]*\}/);
  const target = bracketMatch ? bracketMatch[0] : cleaned;
  return JSON.parse(target);
}

export async function callOpenAI(params: {
  systemPrompt: string;
  userPrompt: string;
  schema: JsonSchemaEnvelope;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ content: string; model: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const model = params.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1200,
      response_format: { type: "json_schema", json_schema: params.schema },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenAI response missing content");
  }

  return { content, model };
}

export async function callGrok(params: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ content: string; model: string } | null> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    return null;
  }
  const model = params.model ?? process.env.GROK_MODEL ?? "grok-beta";
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: params.temperature ?? 0.85,
      max_tokens: params.maxTokens ?? 1200,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Grok response missing content");
  }

  return { content, model };
}

export async function callGemini(params: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<{ content: string; model: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const model = params.model ?? process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = `${params.systemPrompt}\n\n${params.userPrompt}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.75,
        maxOutputTokens: params.maxOutputTokens ?? 1200,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).filter(Boolean).join("\n") ?? "";
  if (!text) {
    throw new Error("Gemini response missing content");
  }

  return { content: text, model };
}
