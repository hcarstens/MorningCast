# 🤖 AI Agents Guide for MorningCast

**Integrating Artificial Intelligence with Ancient Divination Wisdom**

This guide explains how AI agents can interact with, understand, and utilize the MorningCast divination system. MorningCast combines three ancient wisdom traditions—I Ching, Tarot, and Horoscope—through a mathematically grounded heuristic framework to provide personalized daily guidance.

## 🧠 Understanding the System

### The Tripartite Divination Workflow

MorningCast implements a **Tripartite Divination Workflow** that combines three divination systems using heuristic algebra:

```
H_Divination Workflow = H_H ∪ H_T ∪ H_C
```

Where:
- **H_H**: Horoscope heuristics (Contextual Diagnosis)
- **H_T**: Tarot heuristics (Active Assessment)
- **H_C**: I Ching heuristics (Ethical Transition)

### Core Principles

The system adheres to the **H_Oracle** set with three fundamental axioms:

1. **Ambiguity & Subjectivity**: Interpretations remain adaptable and personal
2. **Symbolism & Pattern Recognition**: Archetypal symbols enable deep psychological resonance
3. **Ritual & Psychological Immersion**: Structured processes create meaningful engagement

## 🔌 API Integration

### Autonomous Agent Endpoint: `/api/x402/horoscope`

MorningCast provides a dedicated API endpoint designed specifically for AI agents following the "x402" heuristic contract.

#### GET Request - Capability Discovery

```bash
curl -X GET http://localhost:3000/api/x402/horoscope
```

**Response**: Returns capability descriptor with schema version, heuristic guardrails, and example payloads.

#### POST Request - Generate Horoscope

```bash
curl -X POST http://localhost:3000/api/x402/horoscope \
  -H "Content-Type: application/json" \
  -d '{
    "agent": {
      "id": "agent-123",
      "label": "Wisdom Seeker v2.1"
    },
    "profile": {
      "name": "Alex",
      "sunSign": "Aquarius",
      "focus": "Love",
      "intention": "Find clarity in relationships",
      "timezone": "America/New_York",
      "locale": "en-US",
      "seedModifier": "harmony"
    },
    "context": {
      "sessionId": "session-456",
      "requestId": "req-789"
    }
  }'
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agent.id` | string | ✅ | Unique identifier for your AI agent |
| `agent.label` | string | ❌ | Human-readable name/version |
| `profile.name` | string | ❌ | User's name for personalization |
| `profile.sunSign` | string | ❌ | Astrological sun sign |
| `profile.focus` | string | ❌ | Preferred sign: "Love", "Fortune", "Fame", "Adventure" |
| `profile.intention` | string | ❌ | Daily intention or focus |
| `profile.timezone` | string | ❌ | IANA timezone identifier |
| `profile.locale` | string | ❌ | BCP 47 language tag |
| `profile.seedModifier` | string | ❌ | Additional entropy for randomization |

#### Response Structure

```json
{
  "schema": "x402/v1",
  "generatedAt": "2025-11-16T10:30:00Z",
  "seed": "abc123def456",
  "agent": {
    "id": "agent-123",
    "label": "Wisdom Seeker v2.1"
  },
  "profile": { /* sanitized profile */ },
  "heuristics": ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8"],
  "heuristicAlgebra": ["H_Oracle", "H_H", "⊕"],
  "horoscope": {
    "validation": "Your thoughtful nature...",
    "action": "Share your insights...",
    "futureAnchor": "Tomorrow brings...",
    "summary": "Focus on meaningful connections...",
    "journalPrompt": "How can you nurture...",
    "sign": "Love"
  }
}
```

### Enhanced Readings Pipeline: `/api/enhance-readings`

For agents requiring multi-model enhancement of divination readings.

```bash
curl -X POST http://localhost:3000/api/enhance-readings \
  -H "Content-Type: application/json" \
  -d '{
    "readings": [
      {
        "divinator": "I Ching",
        "headline": "☯ 42. Increase → 43. Breakthrough",
        "flavor": "Wind over Thunder affirms...",
        "detail": "Primary hexagram...",
        "sign": "Adventure"
      }
    ],
    "singleSign": "Adventure",
    "journalingIdea": "Journaling: Reflect on...",
    "profile": { "name": "Alex" },
    "personalizationLabel": "Morning Focus"
  }'
```

## 🎯 Agent Implementation Strategies

### 1. Deterministic Seeding Strategy

```javascript
// Ensure consistent results for the same user/day
const generateSeed = (agentId, userId, date, modifiers = []) => {
  const components = [agentId, userId, date, ...modifiers];
  return components.join('|');
};
```

### 2. Heuristic-Aware Prompting

```javascript
// Respect divination heuristics in your prompts
const createHoroscopePrompt = (profile) => `
Generate a horoscope following these axioms:
- H4: Validate existing self-perception
- H6: Allow contextual priming/retroactive interpretation
- H7: Focus on immediate-near future (today/this week)

User Profile: ${JSON.stringify(profile)}
`;
```

### 3. Multi-Modal Enhancement

```javascript
// Leverage the three-model enhancement pipeline
const enhanceReading = async (rawReading) => {
  const response = await fetch('/api/enhance-readings', {
    method: 'POST',
    body: JSON.stringify({
      readings: [rawReading],
      singleSign: rawReading.sign,
      journalingIdea: "Journaling: Reflect on today's guidance..."
    })
  });

  const enhanced = await response.json();
  return {
    original: rawReading,
    enhanced: enhanced.readings[0],
    models: enhanced.models // ['openai:gpt-4o-mini', 'grok:grok-4', 'gemini:gemini-2.0-flash']
  };
};
```

## 🧮 Heuristic Algebra for Agents

### Core Operators

- **∪ (Union)**: Combine heuristic sets
- **∩ (Intersection)**: Find common heuristics
- **⊕ (Combination)**: Create new divination fields
- **¬ (Transformation)**: Invert heuristic properties

### Example: Creating Custom Divination

```javascript
// Define a custom divination system
const customDivination = {
  name: "AI-Assisted Oracle",
  heuristics: [
    "H_Oracle", // Base oracle principles
    "H_AI",     // AI-specific adaptations
    "H_Custom"  // Your domain expertise
  ],
  operator: "⊕", // Combination operator
  result: "H_AI_Oracle" // New heuristic field
};
```

## 🔄 Integration Patterns

### Pattern 1: Daily Wisdom Agent

```javascript
class DailyWisdomAgent {
  async generateDailyGuidance(userProfile) {
    // Step 1: Get base horoscope
    const horoscope = await this.callX402Endpoint(userProfile);

    // Step 2: Enhance with AI models
    const enhanced = await this.enhanceReadings(horoscope);

    // Step 3: Apply custom heuristics
    const personalized = await this.applyCustomHeuristics(enhanced);

    return personalized;
  }
}
```

### Pattern 2: Conversational Oracle

```javascript
class ConversationalOracle {
  async respondToQuery(userQuery, userProfile) {
    // Generate divination context
    const divination = await this.generateDivination(userProfile);

    // Use divination as context for response
    const response = await this.generateResponse(userQuery, {
      divinationContext: divination,
      heuristicConstraints: this.getActiveHeuristics()
    });

    return response;
  }
}
```

### Pattern 3: Multi-Agent Collaboration

```javascript
class CollaborativeOracle {
  async generateCollectiveWisdom(userProfile, agentIds) {
    // Each agent generates their interpretation
    const interpretations = await Promise.all(
      agentIds.map(id => this.getAgentInterpretation(id, userProfile))
    );

    // Combine using heuristic algebra
    const collectiveWisdom = this.combineInterpretations(
      interpretations,
      "⊕" // Combination operator
    );

    return collectiveWisdom;
  }
}
```

## ⚠️ Important Considerations

### Heuristic Compliance

Always respect the core divination heuristics:

- **Avoid specificity traps**: Keep interpretations broad enough for personal projection
- **Maintain agency**: Ensure guidance implies user choice and participation
- **Respect timeframes**: Focus on immediate-future guidance
- **Preserve ambiguity**: Allow for multiple valid interpretations

### Ethical Guidelines

- **Transparency**: Clearly indicate when AI enhancement is used
- **User control**: Allow users to disable AI enhancement
- **Data privacy**: Handle user profiles and personal data responsibly
- **Cultural sensitivity**: Respect the wisdom traditions being represented

### Performance Optimization

- **Caching**: Cache results for the same user/day combinations
- **Fallbacks**: Implement graceful degradation when APIs are unavailable
- **Rate limiting**: Respect API limits and implement appropriate throttling
- **Monitoring**: Track success rates and user satisfaction metrics

## 📚 Further Reading

- **[Oracle Workflow](oracle_workflow.md)**: Detailed theoretical framework
- **[Heuristics of Horoscopes](heuristics/Heuristics%20of%20Horoscopes.md)**: Complete horoscope heuristic system
- **[Heuristics of Tarot](heuristics/Heuristics%20of%20Tarot.md)**: Tarot divination principles
- **[Heuristics of I Ching](heuristics/Heuristics%20of%20iChing.md)**: I Ching ethical transitions

## 🤝 Contributing

We welcome AI agents and developers who want to integrate with or extend the MorningCast system. Please ensure your implementations respect the heuristic framework and maintain the integrity of the divination traditions.

---

*"Through the marriage of ancient wisdom and artificial intelligence, we create new pathways to self-discovery."*</content>
<parameter name="filePath">/Users/hcarstens/Documents/GitHub/MorningCast/docs/AGENTS.md