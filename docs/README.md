# MorningCast 🌅

**Daily Divination with Olivia**

MorningCast is a unique divination app that combines wisdom from three ancient systems—I Ching, Tarot, and Horoscope—to provide you with personalized daily guidance. Each day, you receive three distinct readings that harmonize into a single guiding sign for your day.

![Daily Divination Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 🔮 Three Divination Systems
- **I Ching**: Delivers ethical transition advice aligned with natural law
- **Tarot**: Offers situational mapping through archetypal symbolism
- **Horoscope**: Provides contextual emotional guidance with celestial wisdom

### 🎯 Single Daily Sign
Your three readings combine into one of four guiding signs:
- **❤️ Love**: Connection, relationships, and heartfelt actions
- **💰 Fortune**: Prosperity, opportunities, and material success
- **⭐ Fame**: Recognition, reputation, and public achievement
- **🗺️ Adventure**: Exploration, discovery, and new experiences

### 🎨 Personalization
- **Profile Settings**: Name, birthdate, and favorite number
- **Daily Intention**: Set your focus for personalized readings
- **Theme Selection**: Choose from Serene, Mystic, or Bold visual themes
- **Focus Override**: Manually set your preferred sign or let the system decide

### 🎲 Deterministic Randomness
- Seeded random number generation ensures consistent daily readings
- Your personal details influence the randomness seed
- Same inputs on the same day = same readings (no refreshing for "better" results)

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- npm v8+

### Run the App
```bash
# Clone the repository
git clone https://github.com/hcarstens/MorningCast.git
cd MorningCast

# Navigate to the app directory
cd morning-cast-app

# Install dependencies (if needed)
npm install

# Start the development server
npm run dev
```

### Configure Environment Keys (Bash)

The divination APIs are only called when the corresponding API keys are present in the environment. To make the keys available in a Bash shell, export them before starting the development server:

```bash
# Run this from the repository root (or add to your shell profile)
export OPENAI_API_KEY="sk-your-openai-key"
export GROK_API_KEY="grok-your-grok-key"
export GEMINI_API_KEY="your-gemini-key"

# Optional model overrides
export OPENAI_MODEL="gpt-4o-mini"
export GROK_MODEL="grok-beta"
export GEMINI_MODEL="gemini-1.5-flash"
```

If you prefer to keep the values between sessions, create `morning-cast-app/.env.local` with the same key/value pairs; Next.js will load them automatically.

Visit `http://localhost:3000` to see your daily divination!

## 🏗️ Project Structure

```
MorningCast/
├── morning-cast-app/              # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main divination interface
│   │   │   ├── layout.tsx        # App layout and metadata
│   │   │   └── globals.css       # Global styles and themes
│   │   ├── components/ui/        # shadcn/ui component library
│   │   └── lib/utils.ts          # Utility functions
│   ├── package.json              # Dependencies and scripts
│   └── tailwind.config.ts        # Tailwind CSS configuration
├── src/                          # Original prototype files
│   ├── morningCast.react         # React component source
│   ├── morningCast_grok          # Development versions
│   └── morningCast2_grok.html    # HTML prototype
├── Heuristics of Horoscopes.md   # Horoscope system documentation
├── Heuristics of Tarot.md        # Tarot system documentation  
├── Heuristics of iChing.md       # I Ching system documentation
├── Heuristics of Oracles.txt     # General oracle principles
├── morningCastWorkflow.json      # Theoretical framework
└── Requirements.txt              # Technical requirements
```

## 🎮 How to Use

1. **Visit the App**: Open `http://localhost:3000` in your browser
2. **View Your Readings**: See today's I Ching, Tarot, and Horoscope readings
3. **Check Your Sign**: Your combined daily sign appears at the top
4. **Personalize** (optional): Click the "Personalize" button to:
   - Set your name, birthdate, and favorite number
   - Write today's intention
   - Choose your visual theme
   - Override the automatic sign selection
5. **Daily Consistency**: Your readings remain the same throughout the day but refresh each new day

## 🧠 The Algorithm

MorningCast uses a sophisticated system to combine three divination traditions:

1. **Seeded Generation**: Your personal details + current date create a unique daily seed
2. **Biased Reading**: Each system has natural tendencies (Horoscope → Love, Tarot → Fame, I Ching → Adventure)
3. **Sign Combination**: The three readings vote for your daily sign, with ties broken randomly
4. **Consistent Results**: Same seed = same readings (no gaming the system!)

## 🎨 Themes

### Serene
Calm slate gradients for peaceful reflection

### Mystic  
Vibrant purple and fuchsia for magical energy

### Bold
Clean neutrals for focused clarity

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🛰️ Server-Side API

MorningCast ships with two Next.js Route Handlers that power the enhanced divination experience. Both routes live under
`morning-cast-app/src/app/api` and return JSON responses tailored for downstream consumers.

### `/api/enhance-readings` (POST)

Pipeline endpoint that accepts the raw divination bundle from the client and runs a three-model orchestration pass:

- **Request Body**
  - `readings` *(required)*: Array of three readings containing `divinator`, `headline`, `flavor`, optional `detail`, and `sign`.
  - `singleSign` *(required)*: One of `Love`, `Fortune`, `Fame`, or `Adventure`.
  - `journalingIdea` *(required)*: Seed journaling prompt from the client.
  - `profile` *(optional)*: Object with viewer metadata used for prompt context.
  - `personalizationLabel` *(optional)*: Short string describing any personalization mode currently active.
- **Processing**
  1. OpenAI blends the readings for narrative Flow, enforcing schema correctness with structured outputs.
  2. Grok transforms tone into a confident, witty Voice while preserving divination guardrails.
  3. Gemini mirrors the insights into sensory Originality and acknowledges model collaboration.
- **Response**
  - `readings`: Enhanced readings, sanitized against the JSON schema contract.
  - `singleSign`: Final guiding sign (identical to the input unless a model violates constraints).
  - `journalingIdea`: Refined journaling prompt.
  - `models`: Array documenting which models responded successfully (`openai:*`, `grok:*`, `gemini:*`).

### `/api/x402/horoscope` (GET, POST)

Autonomous-agent friendly horoscope generator designed for the "x402" heuristic contract.

- **GET**: Returns a capability descriptor with the schema version, heuristic guardrails, and an example request payload.
- **POST**
  - **Request Body** *(JSON)*
    - `agent`: Identifier and optional label for the requesting agent.
    - `profile`: Optional profile including `name`, `sunSign`, `focus`, `intention`, `timezone`, `locale`, and `seedModifier`.
    - `context`: Optional metadata for request tracking.
  - **Processing**
    - Deterministic RNG seeded by the day, agent ID, sun sign, intention, and modifiers ensures repeatable outputs.
    - Heuristic bundles enforce Barnum-style validation, dual polarity traits, ethical tone, and short-term guidance windows.
  - **Response**
    - `schema`, `generatedAt`, and `seed` metadata for observability.
    - Echoed `agent` and sanitized `profile` objects.
    - `heuristics` and `heuristicAlgebra` arrays documenting the applied governance contract.
    - `horoscope`: Fully composed horoscope bundle with validation, action, future anchor, summary, journal prompt, and the resolved sign.

## 📚 Documentation

The project includes extensive documentation of the divination systems:
- **Heuristics of Horoscopes**: Contextual diagnosis and validation
- **Heuristics of Tarot**: Situational mapping and archetypal wisdom  
- **Heuristics of I Ching**: Ethical transitions and natural law
- **Oracle Principles**: Universal divination mechanics

## 🤝 Contributing

This is a research project exploring the intersection of ancient wisdom and modern UX. Contributions welcome!

## 📄 License

MIT License - feel free to fork and experiment!

---

*"Every day you receive three readings — I Ching, Tarot, and Horoscope — which combine into your single sign."*