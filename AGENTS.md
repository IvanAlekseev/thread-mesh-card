# AI Coding Agent Directives & Operational Rules: `thread-mesh-card`

> [!IMPORTANT]
> **MANDATORY OPERATIONAL DIRECTIVES FOR ALL AI AGENTS**
> 1. **Plan First / Explicit Approval Required:** NEVER make code, script, configuration, or documentation changes without first presenting a detailed implementation plan and obtaining explicit user approval. Always present the plan first and wait for confirmation before modifying or committing any files.
> 2. **No Unapproved Git Commits or Push:** NEVER execute `git commit` or `git push` without explicit user instruction. Keep working changes unstaged in the working tree during intermediate steps and iterative tuning; only commit when the user explicitly instructs to commit at a milestone.
> 3. **Zero-Pixel Mandate:** NEVER use hardcoded pixel units (`px`) for responsive layout, typography, canvas margins, node sizes, or mobile clamping. All measurements must be strictly relative:
>    - Canvas geometry & physics clearances must be normalized against viewport radius: $R = \min(\text{width}, \text{height}) / 2$.
>    - Typography in canvas world-space must scale as `fontSize / scale` to maintain crisp, constant screen viewport sizing at all zoom levels.
>    - CSS typography, paddings, and borders must use `rem`, `em`, `%`, `dvh`, and CSS variables (`var(--header-height)`).
>    - Mobile positioning must use dynamic viewport units (`100dvh`) and safe-area insets (`env(safe-area-inset-bottom)`).
> 4. **Grounded Engineering Language:** Strictly avoid promotional or subjective filler adjectives (*"lightweight"*, *"robust"*, *"resilient"*, *"seamless"*, *"production-grade"*). Describe code and features using plain, factual engineering language.
> 5. **Pre-Push Build & Validation Mandate:** Always run `python3 scripts/build.py` to ensure the bundled `dist/thread-mesh-card.js` compiles cleanly with zero stray module syntax before proposing commits or releases.

---

## 1. Codebase Architecture

```
thread-mesh-card/
├── src/
│   ├── constants.js          # SVG icons, version telemetry, role styles, area palettes
│   ├── styles.js             # 100% relative units CSS (rem, em, dvh, safe-area-inset, scoped tooltip)
│   ├── utils.js              # Short name cleaner, shape helpers, Dijkstra pathfinder
│   ├── topology.js           # OTBR & Matter WebSocket enrichment & device matching
│   ├── physics.js            # 360° ring seeding, continuous ray labels, normalized D3 forces
│   ├── hud.js                # Quick status action bar & 6-tile diagnostic drawer
│   ├── controls.js           # 4-button dock listeners, overview modal, guide modal, reset
│   └── thread-mesh-card.js   # Web Component custom element lifecycle & canvas render loop
├── dist/
│   └── thread-mesh-card.js   # Standalone distribution bundle (zero runtime dependencies)
├── scripts/
│   ├── build.py              # Zero-dependency ES module concatenator & validator
│   └── deploy.py             # 1-command build & scp deployer to Home Assistant Green
├── images/
│   └── mesh_topology_overview.png   # Full-bleed starburst topology hero preview
├── AGENTS.md                 # This AI governance guide
├── SPEC.md                   # Complete architectural, physics, and telemetry specification
├── hacs.json                 # HACS compatibility manifest
├── package.json              # Package metadata and NPM build scripts
└── LICENSE                   # MIT License
```

---

## 2. Development & Build Commands

```bash
# Build standalone distribution bundle (dist/thread-mesh-card.js)
python3 scripts/build.py

# Build and deploy directly to Home Assistant Green (192.168.5.100)
python3 scripts/deploy.py
```
