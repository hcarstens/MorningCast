# MorningCast Storydeck — Heuristic Narrative

MorningCast generates on-demand oracle readings across Horoscope, Tarot, and I Ching systems. This storydeck frames the repo through a heuristic lens so new collaborators can quickly see the mission, stakes, and next moves.

## Storydeck Heuristic Contract
| ID | Heuristic Statement | Guardrail |
| --- | --- | --- |
| **S1 Hook** | Start every slide with the unresolved tension or signal it resolves. | Keeps attention rooted in the user's anxiety about uncertainty. |
| **S2 Stakes** | Quantify or qualify what is lost without MorningCast. | Prevents hollow mysticism; every insight must earn its spot. |
| **S3 Mechanism** | Name the divination mechanism or workflow powering the promise. | Forces specificity about how readings are generated. |
| **S4 Proof** | Reference an implemented artifact, heuristic, or API contract. | Grounds claims in verifiable repo assets. |
| **S5 Invitation** | Close with a concrete action, experiment, or metric. | Ensures the narrative ends with momentum. |

Heuristic algebra operators apply across slides:
- **⊕ Combination** blends Horoscope, Tarot, and I Ching heuristics into a single storyline.
- **¬ Transformation** highlights how flipping tone or context spawns alternate use-cases (e.g., bolder agents via `/api/enhance-readings`).
- **∼ Equivalence** maps divination heuristics onto product heuristics (Storydeck → Workflow) so contributors can navigate either frame.

---

## Slide 1 – Signal: Anxiety Around Daily Focus (S1, S2)
- Modern creatives and agents crave fast validation before making bets; randomness feels risky.
- MorningCast positions divination as a deterministic ritual where the same inputs yield the same readings, preventing compulsive refresh loops.
- Without this, operators bounce between conflicting oracles, losing time and trust.

## Slide 2 – Promise: Tripartite Guidance Engine (S1, S3)
- The repo already runs the Tripartite Divination Workflow: Horoscope contextual diagnosis, Tarot active assessment, I Ching ethical transition.
- This ⊕ union satisfies the oracle heuristics of ambiguity, symbolism, ritual, and subjectivity while giving each reading a defined role.
- Result: one synthesized daily sign (Love, Fortune, Fame, Adventure) plus journaling prompt.

## Slide 3 – Mechanism: Deterministic Pipeline (S3, S4)
- README + workflow docs show seeded RNG built from date + profile + agent metadata.
- `/api/x402/horoscope` emits audit-friendly bundles with heuristic traces so autonomous agents can self-serve.
- `/api/enhance-readings` chains OpenAI, Grok, and Gemini via ⊕/¬/∼ prompts, enforcing JSON schemas and tone guardrails.

## Slide 4 – Proof: Heuristic Assets (S4)
- "Heuristics of Horoscopes" lists linguistic, psychological, and ambiguity axioms (e.g., H4 Validation, H6 Contextual Priming, H7 Immediate Future) used by the x402 contract.
- Tarot and I Ching heuristic manuscripts document archetypal mapping, reversibility, and alignment with natural law, mirroring the repo's narrative flow.
- `morningCastWorkflow.json` explicitly applies Heuristic Algebra to demonstrate the combination operator that fuses the three systems.

## Slide 5 – Voice: Guardrailed Creativity (S2, S3, S4)
- `/api/enhance-readings` treats models as characters: Flow (OpenAI), Voice (Grok), Originality (Gemini).
- Each stage mutates tone via explicit heuristic instructions yet preserves divinator, sign, and journaling schema integrity.
- This codifies how we can safely explore ¬ variants (e.g., daring marketing copy) without breaking the oracle contract.

## Slide 6 – Outcome: Single Sign, Daily Ritual (S2, S3)
- App UI (Next.js 15 + React 19) turns the pipeline into a daily ritual: set profile, choose theme, view readings, log intentions.
- Consistency builds trust; users associate each sign with recommended behaviors anchored in Barnum-style validation and action implications.
- Journaling prompt closes the loop, translating divination into micro-decisions.

## Slide 7 – Roadmap Invitations (S5)
1. **Agent Telemetry** ⊕ ∼: Expose heuristic compliance data so other agents can benchmark reliability.
2. **Community Rituals** ⊕: Blend social validation heuristics from `Heuristics of Oracles` with the app's daily cadence (e.g., group spreads).
3. **Transformation Experiments** ¬: Flip specific heuristics (like Tarot's Foreshadowing) to invent new divination modes and log them in `heuristicAlgebra` traces.
4. **Interface Story Mode** ∼: Map the Tripartite phases onto onboarding screens so users learn heuristics while configuring profiles.

## Slide 8 – Call to Action (S5)
- Clone the repo, start `morning-cast-app`, and test `/api/x402/horoscope` with agent metadata to see the heuristic trace in action.
- Contribute new heuristic manuscripts or algebra experiments as markdown alongside the existing oracle docs.
- Share PRs that preserve the Storydeck heuristic contract: every change should state the hook, stakes, mechanism, proof, and invitation.
