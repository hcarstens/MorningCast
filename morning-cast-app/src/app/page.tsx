//GuideMyDay

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Sparkles, Wand2, Compass, Settings2, Heart, Star, TrendingUp, Map } from "lucide-react";

// --- Utility: deterministic PRNG seeded by string (Mulberry32) --- //
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
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

// --- Types --- //
const SIGNS = ["Love", "Fortune", "Fame", "Adventure"] as const;
export type SingleSign = (typeof SIGNS)[number];
export type Divinator = "I Ching" | "Tarot" | "Horoscope";

interface Reading {
  divinator: Divinator;
  headline: string;
  flavor: string;
  sign: SingleSign;
  detail?: string;
}

interface HoroscopePhaseContext {
  validation: string;
  integrationAffirmation: string;
  brightLine: string;
  shadowLine: string;
  reflectionPrompts: [string, string];
  sign: SingleSign;
}

interface IChingPhaseContext {
  primary: HexagramProfile;
  future: HexagramProfile;
  transition: HexagramTransition;
  movement: string;
  movementTone: string;
  counsel: string;
  action: string;
  sign: SingleSign;
  tarotBridgeCue: string;
  ethicalPrompt: string;
}

interface TarotPhaseContext {
  focusCard: TarotSpreadCard;
  focusTone: string;
  futureCard: TarotSpreadCard;
  futureTone: string;
  bridgeAction: string;
  dualPerspective: { bright: string; soft: string };
  ichingImage: string;
}

interface Profile {
  name: string;
  birthdate: string; // ISO yyyy-mm-dd
  birthTime: string; // HH:mm (local) optional
  favoriteNumber: string;
  focus: SingleSign | "Auto";
  intention: string;
  theme: "Serene" | "Mystic" | "Bold";
  readingDate: string; // ISO yyyy-mm-dd optional override
  readingTime: string; // HH:mm optional override
  location: string;
}

// --- Simple theming --- //
const themeToGradient: Record<Profile["theme"], string> = {
  Serene: "from-slate-900 via-slate-800 to-slate-900",
  Mystic: "from-violet-900 via-fuchsia-900 to-indigo-900",
  Bold: "from-zinc-900 via-neutral-900 to-zinc-900",
};

type DayPhaseKey = "dawn" | "morning" | "afternoon" | "evening" | "night";

interface DayPhaseInfo {
  key: DayPhaseKey;
  futureWindow: string;
}

const BARNUM_TRAITS = [
  { bright: "thoughtful", tension: "quietly ambitious" },
  { bright: "warm", tension: "discerning" },
  { bright: "perceptive", tension: "gently protective" },
  { bright: "patient", tension: "softly daring" },
  { bright: "creative", tension: "measured" },
];

const CONTEXT_OPTIONS: Record<DayPhaseKey, string[]> = {
  dawn: [
    "the pre-dawn hush",
    "the way the world stretched before sunrise",
    "the quiet pivot before the city wakes",
  ],
  morning: [
    "the early morning flow",
    "the first conversations of the day",
    "the fresh rhythm after sunrise",
  ],
  afternoon: [
    "the midday hum",
    "the subtle shift after lunch",
    "the pace of the afternoon",
  ],
  evening: [
    "the twilight stretch",
    "the gentle slowdown after work",
    "the glow of the early evening",
  ],
  night: [
    "the night breeze",
    "the soft quiet past sunset",
    "the reflective tone of late evening",
  ],
};

const AGENT_PHRASES = [
  "a trusted ally",
  "a kind colleague",
  "someone you didn’t expect",
  "a nearby supporter",
  "a quiet friend",
];

const TAROT_TRANSITION_CUES = [
  "cut the Tarot deck slowly",
  "fan the Tarot cards into a crescent",
  "shuffle three times while breathing with the change",
  "trace a circle above the deck before you draw",
  "lay the spread with mindful cadence",
];

const HOROSCOPE_SUMMARY_CUES = [
  "name the way you want the day to feel",
  "offer a closing intention aloud",
  "note the moment you’ll revisit this guidance",
  "thank the symbols for their service",
  "choose a gentle next check-in",
];

type TarotOrientation = "upright" | "soft";

type TarotCard = {
  name: string;
  arcana: "Major" | "Wands" | "Cups" | "Swords" | "Pentacles";
  element: "Air" | "Water" | "Fire" | "Earth";
  upright: string;
  soft: string;
};

const TAROT_CARDS: TarotCard[] = [
  {
    name: "The Star",
    arcana: "Major",
    element: "Air",
    upright: "steadied your quiet optimism",
    soft: "asked for a gentle refill of hope",
  },
  {
    name: "Strength",
    arcana: "Major",
    element: "Fire",
    upright: "showed how patience tames effort",
    soft: "invited you to soften self-pressure",
  },
  {
    name: "Temperance",
    arcana: "Major",
    element: "Water",
    upright: "blended your aims into calm balance",
    soft: "nudged you to pace each pour of energy",
  },
  {
    name: "The Chariot",
    arcana: "Major",
    element: "Fire",
    upright: "kept momentum aligned with intention",
    soft: "suggested a course correction made kindly",
  },
  {
    name: "The Lovers",
    arcana: "Major",
    element: "Air",
    upright: "highlighted heartfelt collaboration",
    soft: "asked for a thoughtful mutual check-in",
  },
  {
    name: "Ace of Cups",
    arcana: "Cups",
    element: "Water",
    upright: "opened space for fresh compassion",
    soft: "reminded you to refill emotional reserves",
  },
  {
    name: "Two of Wands",
    arcana: "Wands",
    element: "Fire",
    upright: "charted confident expansion",
    soft: "encouraged drafting kinder milestones",
  },
  {
    name: "Three of Pentacles",
    arcana: "Pentacles",
    element: "Earth",
    upright: "built trust through shared craft",
    soft: "suggested revisiting the plan with care",
  },
  {
    name: "Six of Wands",
    arcana: "Wands",
    element: "Fire",
    upright: "celebrated a visible win",
    soft: "requested humble pride in progress",
  },
  {
    name: "Page of Cups",
    arcana: "Cups",
    element: "Water",
    upright: "welcomed playful curiosity",
    soft: "asked you to listen for tender signals",
  },
  {
    name: "Queen of Swords",
    arcana: "Swords",
    element: "Air",
    upright: "clarified the question with grace",
    soft: "invited kinder internal dialogue",
  },
  {
    name: "Six of Pentacles",
    arcana: "Pentacles",
    element: "Earth",
    upright: "balanced giving with receptive ease",
    soft: "suggested redistributing effort fairly",
  },
];

const TAROT_POSITIONS = [
  { key: "past", label: "Past" },
  { key: "present", label: "Focus" },
  { key: "future", label: "Foreshadow" },
];

type TarotSpreadCard = {
  position: string;
  card: TarotCard;
  orientation: TarotOrientation;
};

function drawTarotSpread(rand: () => number): TarotSpreadCard[] {
  const pool = [...TAROT_CARDS];
  return TAROT_POSITIONS.map(({ label }) => {
    const index = Math.floor(rand() * pool.length);
    const [card] = pool.splice(index, 1);
    const orientation: TarotOrientation = rand() < 0.28 ? "soft" : "upright";
    return {
      position: label,
      card,
      orientation,
    };
  });
}

function formatTarotLine(spreadCard: TarotSpreadCard): string {
  const tone = spreadCard.orientation === "upright" ? spreadCard.card.upright : spreadCard.card.soft;
  const orientationLabel = spreadCard.orientation === "soft" ? " (soft)" : "";
  return `${spreadCard.position} · ${spreadCard.card.name}${orientationLabel} ${tone}.`;
}

function getDayPhase(date: Date): DayPhaseInfo {
  const hour = date.getHours();
  if (hour < 6) return { key: "dawn", futureWindow: "late morning" };
  if (hour < 12) return { key: "morning", futureWindow: "early afternoon" };
  if (hour < 17) return { key: "afternoon", futureWindow: "sunset" };
  if (hour < 21) return { key: "evening", futureWindow: "tonight" };
  return { key: "night", futureWindow: "tomorrow’s first light" };
}

function describeBirthReference(birthMoment?: Date): string | null {
  if (!birthMoment) return null;
  try {
    const month = birthMoment.toLocaleString(undefined, { month: "long" });
    return `${month} beginnings`;
  } catch {
    return null;
  }
}

function combineDateTime(dateStr?: string, timeStr?: string, fallbackTime = "09:00"): Date | null {
  const hasDate = Boolean(dateStr);
  const hasTime = Boolean(timeStr);
  if (!hasDate && !hasTime) return null;
  const now = new Date();
  const base = hasDate ? new Date(`${dateStr}T${timeStr || fallbackTime}`) : new Date(now);
  if (Number.isNaN(base.getTime())) {
    return null;
  }
  if (!hasDate) {
    base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const [fallbackHour, fallbackMinute] = fallbackTime.split(":").map((n) => parseInt(n, 10));
  if (hasTime && timeStr) {
    const [h, m] = timeStr.split(":").map((n) => parseInt(n, 10));
    base.setHours(Number.isFinite(h) ? h : fallbackHour, Number.isFinite(m) ? m : fallbackMinute, 0, 0);
  } else {
    base.setHours(fallbackHour, fallbackMinute, 0, 0);
  }
  return base;
}

function resolveReadingMoment(profile: Profile): Date {
  const customMoment = combineDateTime(profile.readingDate, profile.readingTime, "09:00");
  return customMoment ?? new Date();
}

function resolveBirthMoment(profile: Profile): Date | null {
  if (!profile.birthdate) return null;
  return combineDateTime(profile.birthdate, profile.birthTime, "12:00");
}

function inferSignFromIntention(intention: string): SingleSign | null {
  const text = intention.toLowerCase();
  if (!text.trim()) return null;
  if (/(love|heart|relationship|care|family)/.test(text)) return "Love";
  if (/(money|budget|career|security|stability)/.test(text)) return "Fortune";
  if (/(recognition|audience|share|voice|impact)/.test(text)) return "Fame";
  if (/(journey|travel|explore|learn|adventure|expand)/.test(text)) return "Adventure";
  return null;
}

type LineShift = "yin-to-yang" | "yang-to-yin";

type HexagramTransition = {
  to: number;
  line: number;
  shift: LineShift;
  counsel: string;
  bias: SingleSign;
};

type HexagramProfile = {
  number: number;
  name: string;
  image: string;
  focus: SingleSign[];
  attribute: string;
  action: string;
  transitions: HexagramTransition[];
};

const HEXAGRAMS = {
  11: {
    number: 11,
    name: "Peace",
    image: "earth above heaven",
    focus: ["Love", "Fortune"],
    attribute: "balance rooted in shared ease",
    action: "welcoming calm reciprocity",
    transitions: [
      {
        to: 32,
        line: 2,
        shift: "yin-to-yang",
        counsel: "Commit gently to what keeps the channel steady.",
        bias: "Fortune",
      },
      {
        to: 24,
        line: 6,
        shift: "yang-to-yin",
        counsel: "Close the cycle softly so the next return stays warm.",
        bias: "Love",
      },
    ],
  },
  14: {
    number: 14,
    name: "Great Possession",
    image: "fire above heaven",
    focus: ["Fortune", "Fame"],
    attribute: "abundance stewarded with nobility",
    action: "sharing spotlight to uplift the circle",
    transitions: [
      {
        to: 32,
        line: 1,
        shift: "yin-to-yang",
        counsel: "Anchor resources in rhythms that respect timing.",
        bias: "Fortune",
      },
      {
        to: 50,
        line: 5,
        shift: "yang-to-yin",
        counsel: "Use your spotlight to nourish quieter voices.",
        bias: "Fame",
      },
    ],
  },
  24: {
    number: 24,
    name: "Returning",
    image: "earth above thunder",
    focus: ["Adventure", "Fortune"],
    attribute: "renewal sparked by heartfelt return",
    action: "re-entering the cycle with mindful gratitude",
    transitions: [
      {
        to: 46,
        line: 1,
        shift: "yin-to-yang",
        counsel: "Step back in with optimism; the ground remembers you.",
        bias: "Adventure",
      },
      {
        to: 14,
        line: 4,
        shift: "yang-to-yin",
        counsel: "Bring the lesson home and share the gains lightly.",
        bias: "Fortune",
      },
    ],
  },
  31: {
    number: 31,
    name: "Influence",
    image: "lake above mountain",
    focus: ["Love", "Fame"],
    attribute: "influence born from receptive warmth",
    action: "listening for resonance before moving",
    transitions: [
      {
        to: 46,
        line: 2,
        shift: "yin-to-yang",
        counsel: "Accept help and rise together, not alone.",
        bias: "Adventure",
      },
      {
        to: 11,
        line: 4,
        shift: "yang-to-yin",
        counsel: "Ease the pace so harmony can settle in.",
        bias: "Love",
      },
    ],
  },
  32: {
    number: 32,
    name: "Lasting",
    image: "thunder above wind",
    focus: ["Fortune", "Adventure"],
    attribute: "steadiness that keeps promises breathing",
    action: "keeping rhythm without forcing",
    transitions: [
      {
        to: 53,
        line: 1,
        shift: "yang-to-yin",
        counsel: "Start with a quiet pledge and let trust accrue.",
        bias: "Adventure",
      },
      {
        to: 14,
        line: 4,
        shift: "yin-to-yang",
        counsel: "Share your steadiness so abundance can circulate.",
        bias: "Fortune",
      },
    ],
  },
  46: {
    number: 46,
    name: "Pushing Upward",
    image: "earth above wind",
    focus: ["Adventure", "Fame"],
    attribute: "gentle ascent supported by trust",
    action: "inviting cooperation for each step",
    transitions: [
      {
        to: 11,
        line: 3,
        shift: "yin-to-yang",
        counsel: "Gather allies before the next lift; shared patience brings balance.",
        bias: "Love",
      },
      {
        to: 53,
        line: 5,
        shift: "yin-to-yang",
        counsel: "Keep climbing with kindness—the path opens slowly.",
        bias: "Adventure",
      },
    ],
  },
  50: {
    number: 50,
    name: "The Cauldron",
    image: "fire above wood",
    focus: ["Fame", "Love"],
    attribute: "craft that transforms care into nourishment",
    action: "tending the shared vessel with sincerity",
    transitions: [
      {
        to: 31,
        line: 2,
        shift: "yin-to-yang",
        counsel: "Let sincere offerings draw the right collaborators.",
        bias: "Fame",
      },
      {
        to: 14,
        line: 4,
        shift: "yang-to-yin",
        counsel: "Simplify the recipe so abundance feels shared.",
        bias: "Fortune",
      },
    ],
  },
  53: {
    number: 53,
    name: "Gradual Progress",
    image: "wind above mountain",
    focus: ["Adventure", "Love"],
    attribute: "patience that lets progress unfurl",
    action: "letting each stage ripen naturally",
    transitions: [
      {
        to: 31,
        line: 3,
        shift: "yin-to-yang",
        counsel: "Lead with listening; influence follows patient presence.",
        bias: "Love",
      },
      {
        to: 50,
        line: 5,
        shift: "yang-to-yin",
        counsel: "Refine what you offer so it nourishes everyone.",
        bias: "Fame",
      },
    ],
  },
} satisfies Record<number, HexagramProfile>;

const HEXAGRAM_LIST: HexagramProfile[] = Object.values(HEXAGRAMS);

// --- Generation logic --- //
function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function chooseSignForDivinator(
  rand: () => number,
  divinator: Divinator,
  intention: string
): SingleSign {
  if (divinator === "Horoscope") {
    const inferred = inferSignFromIntention(intention);
    if (inferred) return inferred;
  }

  const bias: Partial<Record<SingleSign, number>> =
    divinator === "Horoscope"
      ? { Love: 0.3, Fortune: 0.25, Fame: 0.2, Adventure: 0.25 }
      : divinator === "Tarot"
      ? { Love: 0.25, Fortune: 0.2, Fame: 0.35, Adventure: 0.2 }
      : { Love: 0.2, Fortune: 0.25, Fame: 0.2, Adventure: 0.35 };

  const weighted = (Object.keys(bias) as SingleSign[]).flatMap((k) =>
    Array.from({ length: Math.round((bias[k] || 0.25) * 100) }, () => k)
  );
  return pick(rand, weighted);
}

function generateIChingReading(
  rand: () => number,
  profile: Profile,
  tarotHandoffSeed: string,
  personalization?: ActivePersonalization | null
): { reading: Reading; context: IChingPhaseContext } {
  const intentionSource = personalization?.profile.intention ?? profile.intention;
  const sign = chooseSignForDivinator(rand, "I Ching", intentionSource);
  const relevantHexagrams = HEXAGRAM_LIST.filter((hex) => hex.focus.includes(sign));
  const primary = relevantHexagrams.length ? pick(rand, relevantHexagrams) : pick(rand, HEXAGRAM_LIST);
  const transition = pick(rand, primary.transitions);
  const future = HEXAGRAMS[transition.to as keyof typeof HEXAGRAMS];
  const movement = transition.shift === "yin-to-yang" ? "yin → yang" : "yang → yin";
  const movementTone =
    transition.shift === "yin-to-yang" ? "inviting gentle action" : "returning to calm receptivity";
  const headline = `☯ ${primary.name} → ${future.name} (${sign})`;
  const flavor = `“${primary.number} ${primary.name}” (${primary.image}) affirms ${primary.attribute}. Line ${
    transition.line
  } shifts ${movement}—${movementTone}—forming “${future.number} ${future.name}”. ${transition.counsel}`;

  const tarotCue = pick(rand, TAROT_TRANSITION_CUES);
  const softenedCounsel = transition.counsel.replace(/\.$/, "");
  const tarotBridgeCue = `${tarotCue} while letting the ${movementTone} rhythm remind you to ${softenedCounsel.toLowerCase()}.`;
  const ethicalPrompt = `How could ${future.action} guide ${tarotHandoffSeed.toLowerCase()} today?`;
  const detail = `Anchor in how ${primary.name.toLowerCase()} becomes ${future.name.toLowerCase()}.
Carry ${primary.attribute} into the next draw and ${tarotBridgeCue} ${
    personalization
      ? `Personalization · “${personalization.label}” steadies how you listen for this shift.`
      : ""
  }`;

  const reading: Reading = {
    divinator: "I Ching",
    headline,
    flavor,
    sign,
    detail,
  };

  const context: IChingPhaseContext = {
    primary,
    future,
    transition,
    movement,
    movementTone,
    counsel: transition.counsel,
    action: future.action,
    sign,
    tarotBridgeCue,
    ethicalPrompt,
  };

  return { reading, context };
}

function generateTarotReading(
  rand: () => number,
  profile: Profile,
  ichingContext: IChingPhaseContext,
  personalization?: ActivePersonalization | null
): { reading: Reading; context: TarotPhaseContext } {
  const spread = drawTarotSpread(rand);
  const intentionSource = personalization?.profile.intention ?? profile.intention;
  const sign = chooseSignForDivinator(rand, "Tarot", intentionSource);
  const flavor = spread.map((card) => formatTarotLine(card)).join(" ");
  const focusCard = spread[1];
  const futureCard = spread[2];
  const focusTone = focusCard.orientation === "upright" ? focusCard.card.upright : focusCard.card.soft;
  const futureTone = futureCard.orientation === "upright" ? futureCard.card.upright : futureCard.card.soft;
  const bridgeAction = `translate ${ichingContext.action} into language that honors ${ichingContext.counsel.toLowerCase()}`;
  const focusDual = `${focusCard.card.name} speaks in radiance as it ${focusCard.card.upright} and in whisper as it ${focusCard.card.soft}.`;
  const futureDual = `${futureCard.card.name} echoes with clarity when upright (${futureCard.card.upright}) and softens into ${futureCard.card.soft}.`;
  const detail = `The I Ching framed the shift from ${
    ichingContext.primary.name
  } to ${ichingContext.future.name}, asking for ${ichingContext.counsel.toLowerCase()}. ${focusDual} ${futureDual} Let ${
    focusCard.card.name
  } translate ${ichingContext.movementTone} into action while ${futureCard.card.name} ${futureTone} as you sit with the question “${
    ichingContext.ethicalPrompt
  }” — carry this story forward by planning how you’ll ${bridgeAction}.${
    personalization
      ? ` Personalization · “${personalization.label}” keeps the spread aligned with the tone you saved.`
      : ""
  }`;

  const reading: Reading = {
    divinator: "Tarot",
    headline: `♠︎ Tarot maps ${sign}`,
    flavor,
    sign,
    detail,
  };

  const contextPayload: TarotPhaseContext = {
    focusCard,
    focusTone,
    futureCard,
    futureTone,
    bridgeAction,
    dualPerspective: { bright: focusCard.card.upright, soft: focusCard.card.soft },
    ichingImage: ichingContext.primary.image,
  };

  return { reading, context: contextPayload };
}

function generateHoroscopeReading(
  rand: () => number,
  profile: Profile,
  readingMoment: Date,
  birthMoment: Date | null,
  ichingContext: IChingPhaseContext,
  tarotContext: TarotPhaseContext,
  personalization?: ActivePersonalization | null
): { reading: Reading; context: HoroscopePhaseContext } {
  const dayPhase = getDayPhase(readingMoment);
  const trait = pick(rand, BARNUM_TRAITS);
  const context = pick(rand, CONTEXT_OPTIONS[dayPhase.key]);
  const agent = pick(rand, AGENT_PHRASES);
  const summaryCue = pick(rand, HOROSCOPE_SUMMARY_CUES);
  const birthRef = describeBirthReference(birthMoment ?? undefined);
  const personaProfile = personalization?.profile ?? profile;
  const location = personaProfile.location.trim();
  const locationClause = location ? ` while you move through ${location}` : "";
  const validation = `Your ${trait.bright} yet ${trait.tension} nature${
    birthRef ? `, rooted in your ${birthRef},` : ""
  } has been sensing how ${ichingContext.primary.name.toLowerCase()} becomes ${ichingContext.future.name.toLowerCase()} amid ${context}${locationClause}.`;

  const integrationAffirmation = `Let ${tarotContext.focusCard.card.name} keep that shift conversational so ${tarotContext.futureCard.card.name} can ${tarotContext.futureTone.toLowerCase()} before ${dayPhase.futureWindow}.`;
  const brightLine = `Bright path · Share ${tarotContext.dualPerspective.bright} with ${agent} to reinforce ${ichingContext.action}.`;
  const shadowLine = `Shadow companion · If hesitation surfaces, revisit ${tarotContext.focusCard.card.name}’s softer cue—${tarotContext.dualPerspective.soft}.`;
  const reflectionPrompts: [string, string] = [
    ichingContext.ethicalPrompt,
    `How will ${tarotContext.focusCard.card.name} and ${tarotContext.futureCard.card.name} color the way you ${summaryCue}?`,
  ];

  const intentionSource = personalization?.profile.intention ?? profile.intention;
  const sign = chooseSignForDivinator(rand, "Horoscope", intentionSource);

  const detail = `${integrationAffirmation} ${brightLine} ${shadowLine} Reflection cues · “${
    reflectionPrompts[0]
  }” · “${reflectionPrompts[1]}”${
    personalization
      ? ` Personalization · “${personalization.label}” keeps this integration tuned to your saved cadence.`
      : ""
  }`;

  const reading: Reading = {
    divinator: "Horoscope",
    headline: `★ Horoscope integrates ${sign}`,
    flavor: validation,
    sign,
    detail,
  };

  const contextPayload: HoroscopePhaseContext = {
    validation,
    integrationAffirmation,
    brightLine,
    shadowLine,
    reflectionPrompts,
    sign,
  };

  return { reading, context: contextPayload };
}

function combineToSingleSign(readings: Reading[], rand: () => number, focus: Profile["focus"]): SingleSign {
  if (focus && focus !== "Auto") return focus;
  const counts: Record<SingleSign, number> = { Love: 0, Fortune: 0, Fame: 0, Adventure: 0 };
  readings.forEach((r) => (counts[r.sign]++));
  const max = Math.max(...Object.values(counts));
  const leaders = (Object.keys(counts) as SingleSign[]).filter((k) => counts[k] === max);
  return pick(rand, leaders);
}

function generateJournalingIdea(readings: Reading[], singleSign: SingleSign): string {
  if (readings.length < 3) return "Reflect on how these insights might guide your day.";

  const iching = readings.find(r => r.divinator === "I Ching");
  const tarot = readings.find(r => r.divinator === "Tarot");
  const horoscope = readings.find(r => r.divinator === "Horoscope");

  // Extract key elements from each reading
  const ichingAction = iching?.detail?.split('.')[0] || "this transition";
  const tarotCard = tarot?.flavor?.split('·')[1]?.split('(')[0]?.trim() || "your guide";
  const horoscopePrompt = horoscope?.detail?.split('Reflection cues ·')[1]?.split('·')[0]?.replace(/"/g, '') || "your inner wisdom";

  return `How might ${ichingAction.toLowerCase()} guide your ${singleSign.toLowerCase()} journey, with ${tarotCard.toLowerCase()} as your ally and "${horoscopePrompt}" as your compass?`;
}

function dailySeed(profile: Profile, readingMoment: Date): string {
  const yyyy = readingMoment.getFullYear();
  const mm = String(readingMoment.getMonth() + 1).padStart(2, "0");
  const dd = String(readingMoment.getDate()).padStart(2, "0");
  const hh = String(readingMoment.getHours()).padStart(2, "0");
  const min = String(readingMoment.getMinutes()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  const p = `${profile.name}|${profile.birthdate}|${profile.birthTime}|${profile.favoriteNumber}|${profile.intention}|${profile.focus}|${profile.theme}|${profile.location}|${profile.readingDate}|${profile.readingTime}`;
  return `v2:${dateKey}:${p}`;
}

const DEFAULT_PROFILE: Profile = {
  name: "Traveler",
  birthdate: "",
  birthTime: "",
  favoriteNumber: "",
  focus: "Auto",
  intention: "",
  theme: "Mystic",
  readingDate: "",
  readingTime: "",
  location: "",
};

const PROFILE_STORAGE_KEY = "dd.profile";
const SAVED_STORAGE_KEY = "dd.savedProfiles";
const ACTIVE_STORAGE_KEY = "dd.activePersonalization";

type SavedPersonalization = {
  id: string;
  label: string;
  profile: Profile;
  updatedAt: string;
};

type ActivePersonalization = {
  id: string;
  label: string;
  profile: Profile;
};

function applyProfileDefaults(data?: Partial<Profile> | null): Profile {
  return { ...DEFAULT_PROFILE, ...(data || {}) };
}

function createPersonalizationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `personalization-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

function areProfilesEqual(a: Profile, b: Profile): boolean {
  return (
    a.name === b.name &&
    a.birthdate === b.birthdate &&
    a.birthTime === b.birthTime &&
    a.favoriteNumber === b.favoriteNumber &&
    a.focus === b.focus &&
    a.intention === b.intention &&
    a.theme === b.theme &&
    a.readingDate === b.readingDate &&
    a.readingTime === b.readingTime &&
    a.location === b.location
  );
}

function loadSavedPersonalizationsFromStorage(): SavedPersonalization[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as unknown[])
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const record = entry as Record<string, unknown>;
        const id = typeof record.id === "string" ? record.id : null;
        const label = typeof record.label === "string" ? record.label.trim() : "";
        const profileData =
          record.profile && typeof record.profile === "object"
            ? (record.profile as Partial<Profile>)
            : {};
        const updatedAt =
          typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString();
        if (!id) return null;
        return {
          id,
          label: label || "Untitled",
          profile: applyProfileDefaults(profileData),
          updatedAt,
        } as SavedPersonalization;
      })
      .filter(Boolean) as SavedPersonalization[];
  } catch {
    return [];
  }
}

function loadActivePersonalizationIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(ACTIVE_STORAGE_KEY);
    return stored ? stored : null;
  } catch {
    return null;
  }
}

export default function DailyDivinationApp() {
  const [savedPersonalizations, setSavedPersonalizations] = useState<SavedPersonalization[]>([]);
  const [activePersonalizationId, setActivePersonalizationId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [draftPersonalizationId, setDraftPersonalizationId] = useState<string | null>(null);
  const [personalizationLabel, setPersonalizationLabel] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load data from localStorage after component mounts
  useEffect(() => {
    setIsClient(true);
    const storedSaved = loadSavedPersonalizationsFromStorage();
    const storedActiveId = loadActivePersonalizationIdFromStorage();

    setSavedPersonalizations(storedSaved);
    setActivePersonalizationId(storedActiveId);

    if (storedActiveId) {
      const match = storedSaved.find((entry) => entry.id === storedActiveId);
      if (match) {
        setProfile(applyProfileDefaults(match.profile));
        setDraftProfile(applyProfileDefaults(match.profile));
        return;
      }
    }

    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const loadedProfile = raw ? applyProfileDefaults(JSON.parse(raw)) : DEFAULT_PROFILE;
      setProfile(loadedProfile);
      setDraftProfile(loadedProfile);
    } catch {
      setProfile(DEFAULT_PROFILE);
      setDraftProfile(DEFAULT_PROFILE);
    }
  }, []);

  const activePersonalization = useMemo(() => {
    if (!activePersonalizationId) return null;
    return savedPersonalizations.find((entry) => entry.id === activePersonalizationId) ?? null;
  }, [activePersonalizationId, savedPersonalizations]);

  const personalizationForGenerators = useMemo(() => {
    if (activePersonalization) return activePersonalization;
    if (!areProfilesEqual(profile, DEFAULT_PROFILE)) {
      const fallbackLabel = profile.name.trim() || "Custom profile";
      return { id: "custom", label: fallbackLabel, profile };
    }
    return null;
  }, [activePersonalization, profile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      } catch {}
    }
  }, [profile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const payload = savedPersonalizations.map((entry) => ({
          id: entry.id,
          label: entry.label,
          profile: entry.profile,
          updatedAt: entry.updatedAt,
        }));
        window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(payload));
      } catch {}
    }
  }, [savedPersonalizations]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (activePersonalizationId && activePersonalization) {
        window.localStorage.setItem(ACTIVE_STORAGE_KEY, activePersonalizationId);
      } else {
        window.localStorage.removeItem(ACTIVE_STORAGE_KEY);
      }
    } catch {}
  }, [activePersonalizationId, activePersonalization]);

  const readingMoment = useMemo(() => resolveReadingMoment(profile), [profile]);
  const birthMoment = useMemo(() => resolveBirthMoment(profile), [profile]);
  const seedKey = useMemo(() => dailySeed(profile, readingMoment), [profile, readingMoment]);
  const rand = useMemo(() => seededRandom(seedKey), [seedKey]);

  const readings = useMemo(() => {
    if (!isClient) return [];
    const handoffSeed = (personalizationForGenerators?.profile.intention || profile.intention || "the Tarot draw").trim() ||
      "the Tarot draw";
    const { reading: iching, context: ichingContext } = generateIChingReading(
      rand,
      profile,
      handoffSeed,
      personalizationForGenerators
    );
    const { reading: tarot, context: tarotContext } = generateTarotReading(
      rand,
      profile,
      ichingContext,
      personalizationForGenerators
    );
    const { reading: horoscope } = generateHoroscopeReading(
      rand,
      profile,
      readingMoment,
      birthMoment,
      ichingContext,
      tarotContext,
      personalizationForGenerators
    );
    return [iching, tarot, horoscope];
  }, [rand, profile, readingMoment, birthMoment, personalizationForGenerators, isClient]);

  const singleSign = useMemo(() => {
    if (!isClient || readings.length === 0) return "Love";
    return combineToSingleSign(readings, rand, profile.focus);
  }, [readings, rand, profile.focus, isClient]);

  const journalingIdea = useMemo(() => {
    if (!isClient || readings.length === 0) return "Reflect on how these insights might guide your day.";
    return generateJournalingIdea(readings, singleSign);
  }, [readings, singleSign, isClient]);

  const handleSavePersonalization = () => {
    const label = personalizationLabel.trim();
    if (!label) return;
    const snapshot: Profile = { ...draftProfile };
    const timestamp = new Date().toISOString();
    let resolvedId = draftPersonalizationId ?? "";
    setSavedPersonalizations((prev) => {
      const existingIndex = draftPersonalizationId
        ? prev.findIndex((item) => item.id === draftPersonalizationId)
        : -1;
      if (existingIndex >= 0) {
        resolvedId = draftPersonalizationId!;
        const next = [...prev];
        next[existingIndex] = {
          id: resolvedId,
          label,
          profile: { ...snapshot },
          updatedAt: timestamp,
        };
        return next;
      }
      const duplicate = prev.find((item) => item.label.toLowerCase() === label.toLowerCase());
      if (duplicate) {
        resolvedId = duplicate.id;
        return prev.map((item) =>
          item.id === duplicate.id
            ? { id: duplicate.id, label, profile: { ...snapshot }, updatedAt: timestamp }
            : item
        );
      }
      resolvedId = createPersonalizationId();
      return [
        ...prev,
        {
          id: resolvedId,
          label,
          profile: { ...snapshot },
          updatedAt: timestamp,
        },
      ];
    });
    setDraftPersonalizationId(resolvedId || null);
    setPersonalizationLabel(label);
  };

  const handleClearDraftPersonalization = () => {
    setDraftPersonalizationId(null);
    setPersonalizationLabel("");
  };

  const handleLoadPersonalization = (entry: SavedPersonalization) => {
    setDraftProfile({ ...entry.profile });
    setDraftPersonalizationId(entry.id);
    setPersonalizationLabel(entry.label);
  };

  const handleUsePersonalization = (entry: SavedPersonalization) => {
    const snapshot: Profile = { ...entry.profile };
    setProfile(snapshot);
    setDraftProfile(snapshot);
    setActivePersonalizationId(entry.id);
    setDraftPersonalizationId(entry.id);
    setPersonalizationLabel(entry.label);
    setOpen(false);
  };

  const handleDeletePersonalization = (id: string) => {
    setSavedPersonalizations((prev) => prev.filter((entry) => entry.id !== id));
    if (draftPersonalizationId === id) {
      setDraftPersonalizationId(null);
      setPersonalizationLabel("");
    }
    if (activePersonalizationId === id) {
      setActivePersonalizationId(null);
    }
  };

  const handleApplyDraftProfile = () => {
    const snapshot: Profile = { ...draftProfile };
    const matchingSaved =
      draftPersonalizationId && savedPersonalizations.find((item) => item.id === draftPersonalizationId);
    const matchesSaved = matchingSaved ? areProfilesEqual(matchingSaved.profile, snapshot) : false;
    setProfile(snapshot);
    setActivePersonalizationId(matchesSaved && matchingSaved ? matchingSaved.id : null);
    setOpen(false);
  };

  const handleResetProfile = () => {
    const resetSnapshot: Profile = { ...DEFAULT_PROFILE };
    setDraftProfile(resetSnapshot);
    setDraftPersonalizationId(null);
    setPersonalizationLabel("");
    setProfile(resetSnapshot);
    setActivePersonalizationId(null);
  };

  const handleSheetOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraftProfile({ ...profile });
      setDraftPersonalizationId(activePersonalization?.id ?? null);
      setPersonalizationLabel(activePersonalization?.label ?? "");
    }
  };

  const dateLabel = useMemo(() => {
    if (!isClient) return "Loading...";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
    };
    return readingMoment.toLocaleDateString("en-US", options);
  }, [readingMoment, isClient]);

  const timeLabel = useMemo(() => {
    if (!isClient) return "Loading...";
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
    };
    return readingMoment.toLocaleTimeString("en-US", options);
  }, [readingMoment, isClient]);
  const locationLabel = profile.location.trim();

  const themeGradient = themeToGradient[profile.theme];

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${themeGradient} text-slate-100`}>      
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Daily Divination with Olivia</h1>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-80 flex-wrap justify-end" suppressHydrationWarning>
            <CalendarDays className="w-4 h-4" />
            <span>{dateLabel}</span>
            {isClient && (
              <>
                <span className="opacity-60">•</span>
                <span>{timeLabel}</span>
                {locationLabel && (
                  <>
                    <span className="opacity-60">•</span>
                    <span>{locationLabel}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm opacity-80">Every day you receive three readings — I Ching, Tarot, and Horoscope — which combine into your single sign.</p>
      </div>

      {/* Top: Single Sign */}
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardHeader className="flex items-center sm:flex-row sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Badge variant="secondary" className="text-base px-3 py-1 rounded-2xl bg-white/10 border border-white/20">
                  {singleSign}
                </Badge>
                <span className="opacity-90">Your Single Sign for Today</span>
              </CardTitle>
              <div className="flex items-center gap-2 text-xs opacity-80">
                <span className="hidden sm:block">Seed</span>
                <code className="bg-black/30 px-2 py-1 rounded">{seedKey.slice(-10)}</code>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SIGNS.map((s) => (
                  <div key={s} className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${s === singleSign ? "border-white/60 bg-white/10" : "border-white/10 bg-white/5 opacity-80"}`}>
                    {s === "Love" && <Heart className="w-4 h-4" />} 
                    {s === "Fortune" && <TrendingUp className="w-4 h-4" />} 
                    {s === "Fame" && <Star className="w-4 h-4" />} 
                    {s === "Adventure" && <Map className="w-4 h-4" />} 
                    <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm opacity-90">
                {journalingIdea}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Readings Grid */}
      <div className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {isClient && readings.length > 0 ? (
          readings.map((r) => (
            <motion.div key={r.divinator} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="h-full bg-white/5 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {r.divinator === "Horoscope" && <Wand2 className="w-5 h-5" />} 
                    {r.divinator === "Tarot" && <Sparkles className="w-5 h-5" />} 
                    {r.divinator === "I Ching" && <Compass className="w-5 h-5" />} 
                    {r.divinator}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm opacity-90">{r.headline}</div>
                    <div className="text-sm opacity-80">{r.flavor}</div>
                    {r.detail && <div className="text-xs opacity-70 leading-relaxed">{r.detail}</div>}
                    <div className="mt-2">
                      <Badge className="bg-white/10 border-white/20">{r.sign}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          // Loading skeleton for readings
          Array.from({ length: 3 }, (_, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <Card className="h-full bg-white/5 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-5 h-5 bg-white/10 rounded animate-pulse"></div>
                    <div className="w-20 h-6 bg-white/10 rounded animate-pulse"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-white/10 rounded animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse"></div>
                    <div className="w-1/2 h-3 bg-white/10 rounded animate-pulse"></div>
                    <div className="mt-2">
                      <div className="w-12 h-5 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Personalize Button (bottom-right) */}
      <div className="fixed right-4 bottom-4">
        <Sheet open={open} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button className="rounded-2xl shadow-xl" variant="secondary">
              <Settings2 className="w-4 h-4 mr-2" /> Personalize
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-neutral-950 text-slate-100 border-white/10 w-[520px] max-w-full overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Personalize your readings</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">Saved personalizations</span>
                  {activePersonalization && (
                    <Badge className="bg-white/10 border-white/20 text-[11px] uppercase tracking-wide">
                      Active · {activePersonalization.label}
                    </Badge>
                  )}
                </div>
                {savedPersonalizations.length === 0 ? (
                  <p className="text-xs opacity-70">
                    Save settings to reuse them later. Everything stays on this device.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedPersonalizations.map((item) => {
                      const isActive = activePersonalization?.id === item.id;
                      const updatedAt = new Date(item.updatedAt);
                      const updatedText = Number.isNaN(updatedAt.getTime())
                        ? "Recently saved"
                        : `Updated ${updatedAt.toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}`;
                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col gap-2 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between ${
                            isActive ? "border-white/50 bg-white/10" : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div>
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-[11px] uppercase tracking-wide opacity-60">{updatedText}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handleUsePersonalization(item)}>
                              Use
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleLoadPersonalization(item)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-200 hover:text-rose-100"
                              onClick={() => handleDeletePersonalization(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <Label htmlFor="personalizationLabel">Save these settings</Label>
                <Input
                  id="personalizationLabel"
                  placeholder="e.g., Sunrise focus"
                  value={personalizationLabel}
                  onChange={(e) => setPersonalizationLabel(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={handleSavePersonalization} disabled={!personalizationLabel.trim()}>
                    Save personalization
                  </Button>
                  {draftPersonalizationId && (
                    <Button size="sm" variant="ghost" onClick={handleClearDraftPersonalization}>
                      New label
                    </Button>
                  )}
                </div>
                <p className="text-xs opacity-70">
                  Give this configuration a name so you can restore it instantly later.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Traveler"
                    value={draftProfile.name}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="birthdate">Birthdate</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={draftProfile.birthdate}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, birthdate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="birthTime">Birth time (optional)</Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={draftProfile.birthTime}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, birthTime: e.target.value }))}
                  />
                  <p className="text-xs opacity-70 mt-1">Add it if you know the local time; blank keeps things gently vague.</p>
                </div>
                <div>
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    placeholder="City, region"
                    value={draftProfile.location}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="favoriteNumber">Favorite number</Label>
                  <Input
                    id="favoriteNumber"
                    inputMode="numeric"
                    placeholder="7"
                    value={draftProfile.favoriteNumber}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, favoriteNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={draftProfile.theme}
                    onValueChange={(v: Profile["theme"]) => setDraftProfile((p) => ({ ...p, theme: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Serene">Serene</SelectItem>
                      <SelectItem value="Mystic">Mystic</SelectItem>
                      <SelectItem value="Bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="readingDate">Reading date (optional)</Label>
                  <Input
                    id="readingDate"
                    type="date"
                    value={draftProfile.readingDate}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, readingDate: e.target.value }))}
                  />
                  <p className="text-xs opacity-70 mt-1">Leave blank to anchor to today’s date automatically.</p>
                </div>
                <div>
                  <Label htmlFor="readingTime">Reading time (optional)</Label>
                  <Input
                    id="readingTime"
                    type="time"
                    value={draftProfile.readingTime}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, readingTime: e.target.value }))}
                  />
                  <p className="text-xs opacity-70 mt-1">Leave blank to capture the moment you open the app.</p>
                </div>
              </div>
              <div>
                <Label>Focus (override)</Label>
                <Select
                  value={draftProfile.focus}
                  onValueChange={(v: Profile["focus"]) => setDraftProfile((p) => ({ ...p, focus: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auto">Auto (let the three decide)</SelectItem>
                    {SIGNS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs opacity-70 mt-1">Choose a focus to always make your single sign match, or leave as Auto.</p>
              </div>
              <div>
                <Label htmlFor="intention">Intention (today)</Label>
                <Textarea
                  id="intention"
                  placeholder="e.g., Make steady progress on my craft."
                  rows={3}
                  value={draftProfile.intention}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, intention: e.target.value }))}
                />
                <p className="text-xs opacity-70 mt-1">
                  Your name, birth details, favorite number, intention, location, and reading moment gently shape today’s seed.
                </p>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <div className="flex items-center gap-3 ml-auto">
                <Button variant="ghost" onClick={handleResetProfile}>
                  Reset
                </Button>
                <Button onClick={handleApplyDraftProfile}>Save & Refresh</Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 py-10 opacity-70 text-xs">
        Built as a lightweight prototype. Readings refresh daily and after personalization. Data lives locally in your browser.
      </div>
    </div>
  );
}
