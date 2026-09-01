# Skillset Knowledge Inventory & Router

This repository contains **68 production AI agent skills** organized across **7 knowledge domains**.

Each skill is a self-contained directory containing a `SKILL.md` file (with instructions and metadata) along with any associated scripts, references, templates, or test suites.

---

## Fast Router

| If the request is about… | Start with | Then add when relevant |
|---|---|---|
| A new frontend or landing page | `design-taste-frontend` | `frontend-tdd-flow`, `minimalist`, a visual-direction skill |
| Improving an existing site/app | `redesign-existing-projects` | `mobile-adaptive-ux-skill`, `frontend-tdd-flow`, `ai-discovery-marketability-skill` |
| A site that works well on phones | `mobile-adaptive-ux-skill` | `frontend-tdd-flow` |
| Tests-first frontend work | `frontend-tdd-flow` | `minimalist` |
| A premium website visual direction | Choose one UI style skill below | `image-to-code` or `imagegen-frontend-web` if a visual reference is needed |
| Implementing from a screenshot/design image | `image-to-code` | `frontend-tdd-flow` |
| Website SEO, AI visibility, citation, recommendations, or agent-ready buying flows | `ai-discovery-marketability-skill` | `marketing-optimizer`, `turkey-ecommerce-compliance-skill` |
| A new agent/copilot/conversational product | `agent-native-app-architecture` | the appropriate frontend and testing skills |
| An advanced Three.js scene | `threejs-skill-router` | only the specific Three.js system skills it selects |
| Image generation or image editing | `image-gen` | — |
| Video generation | `veo-video-gen` or `kling-video-gen` | `veo` where its own runtime/workflow is preferred |
| Fashion / E-commerce Product Videos | `fashion-product-video-gen` | Uses Veo 3.1 / Kling with edge-sampled 9:16 framing, fabric physics & closed loops |
| Natural, Craft & Botanical Product Videos | `natural-product-video-gen` | Artisanal, hemp textiles, botanical oils, ceramics, closed-loop micro-sway & light caustics |
| A report, magazine, book, handbook, or print PDF | `publication-designer` | `pandoc-typesetting` or `puppeteer-pdf` |
| Audio/video transcription, studio, speaker attribution, or media analysis | `transcribe-media` | — |
| A Turkish e-commerce audit | `turkey-ecommerce-compliance-skill` | `ai-discovery-marketability-skill` or `marketing-optimizer` |
| Security vulnerabilities/CVEs | `vulnerability-scanner` | — |
| Planning, implementing, reviewing, or reverting a tracked project change | matching `conductor-*` skill | `conductor-status` to inspect current progress |

---

## Knowledge Domains

### 1. 3D & Procedural Three.js (24 Skills)

Start with `threejs-skill-router` for new or broad graphics work.

| Skill | Path | What it knows / does |
|---|---|---|
| `threejs-skill-router` | `threejs-skill-router/SKILL.md` | Routes ambitious Three.js graphics work to the smallest expert skill set |
| `threejs-camera-direction` | `threejs-camera-direction/SKILL.md` | Directs scale-aware chase rigs, thrust lag, side/orbit cameras |
| `threejs-visual-validation` | `threejs-visual-validation/SKILL.md` | Validates Three.js graphics with fixed-view visual contracts and regression checks |
| `threejs-procedural-geometry` | `threejs-procedural-geometry/SKILL.md` | Procedural mesh systems, rail/frame profiles, oriented branch rings |
| `threejs-procedural-architecture` | `threejs-procedural-architecture/SKILL.md` | Massing grammars, building kits, exposed-edge analysis |
| `threejs-procedural-planets` | `threejs-procedural-planets/SKILL.md` | Spherical terrain, continents, ridges, craters, biomes |
| `threejs-procedural-vegetation` | `threejs-procedural-vegetation/SKILL.md` | Surface-following vines, trees, grass, painted ivy |
| `threejs-procedural-fields` | `threejs-procedural-fields/SKILL.md` | Coherent scalar/vector noise fields for terrain, planets, wear |
| `threejs-procedural-materials` | `threejs-procedural-materials/SKILL.md` | Hybrid texture-backed PBR soil/moss with procedural displacement |
| `threejs-parallax-occlusion-mapping` | `threejs-parallax-occlusion-mapping/SKILL.md` | Silhouette-aware POM in WebGPU/TSL with height-field ray marching |
| `threejs-precipitation-surfaces` | `threejs-precipitation-surfaces/SKILL.md` | Falling snow, snow accumulation, wetness and rain streaks |
| `threejs-temporal-surfaces` | `threejs-temporal-surfaces/SKILL.md` | Touch-history frost/thaw, ping-pong accumulation buffers |
| `threejs-atmosphere-aerial-perspective` | `threejs-atmosphere-aerial-perspective/SKILL.md` | Physically motivated sky, rayleigh/mie scattering, ground-to-space |
| `threejs-volumetric-clouds` | `threejs-volumetric-clouds/SKILL.md` | Weather-driven density, bounded raymarching, shape/detail erosion |
| `threejs-spectral-ocean` | `threejs-spectral-ocean/SKILL.md` | WebGPU/TSL FFT oceans, directional wave spectra |
| `threejs-water-optics` | `threejs-water-optics/SKILL.md` | Multi-wave displacement, normals, bounded RGB absorption/scattering |
| `threejs-procedural-animation` | `threejs-procedural-animation/SKILL.md` | Launch kinematics, gravity turns, staging, spin docking |
| `threejs-procedural-vfx` | `threejs-procedural-vfx/SKILL.md` | Ship reentry plasma, capsule wakes, instanced sparks/smoke |
| `threejs-raymarched-space-effects` | `threejs-raymarched-space-effects/SKILL.md` | Black hole gravitational lensing, accretion disks, curved rays |
| `threejs-shadow-systems` | `threejs-shadow-systems/SKILL.md` | Cascaded directional shadows, stable bounds, filtering |
| `threejs-screen-space-ambient-occlusion` | `threejs-screen-space-ambient-occlusion/SKILL.md` | Half-resolution GTAO, horizon sampling, reversed-depth reconstruction |
| `threejs-bloom` | `threejs-bloom/SKILL.md` | HDR signal ordering, bloom-node controls, dual selective passes |
| `threejs-exposure-color-grading` | `threejs-exposure-color-grading/SKILL.md` | 64x36 encoded luminance meter, async readback, LUT grading |
| `threejs-image-pipeline` | `threejs-image-pipeline/SKILL.md` | Depth, normal, albedo history ownership and composed post-processing |

---

### 2. Frontend Experience & Engineering (11 Skills)

| Skill | Path | What it knows / does |
|---|---|---|
| `design-taste-frontend` | `design-taste-frontend/SKILL.md` | Non-generic marketing pages, portfolios and redesigns |
| `redesign-existing-projects` | `redesign-existing-projects/SKILL.md` | UI/UX audit and transformation of existing web applications |
| `frontend-tdd-flow` | `frontend-tdd-flow/SKILL.md` | Frontend specs; Playwright user-story, SEO/GEO and layout tests |
| `mobile-adaptive-ux-skill` | `mobile-adaptive-ux-skill/SKILL.md` | Touch-first task flows, mobile IA, accessibility, viewport redesign |
| `lighthouse-performance-maximizer` | `lighthouse-performance-maximizer/SKILL.md` | Closed-loop Lighthouse, Core Web Vitals (LCP/INP/CLS) optimization |
| `landing-page` | `landing-page/SKILL.md` | Complete standalone responsive marketing page with Tailwind CSS |
| `image-to-code` | `image-to-code/SKILL.md` | Visual-reference analysis and faithful web implementation |
| `scroll-world` | `scroll-world/SKILL.md` | Continuous scroll-scrubbed cinematic/diorama web experiences |
| `minimalist` | `minimalist/SKILL.md` | YAGNI, native/platform reuse, minimum safe engineering |
| `full-output-enforcement` | `full-output-enforcement/SKILL.md` | Complete, non-placeholder production outputs |
| `agent-native-app-architecture` | `agent-native-app-architecture/SKILL.md` | Copilots, conversational/voice intent, generative UI, agent protocols |

---

### 3. UI Visual Languages & Design Systems (7 Skills)

| Skill | Path | Competency / aesthetic |
|---|---|---|
| `gpt-taste` | `gpt-taste/SKILL.md` | Awwwards-style editorial pages, GSAP motion, varied bento layouts |
| `high-end-visual-design` | `high-end-visual-design/SKILL.md` | High-end agency visual systems, typography hierarchy, depth and motion |
| `minimalist-ui` | `minimalist-ui/SKILL.md` | Warm editorial minimalism, flat bento layouts, restrained palettes |
| `industrial-brutalist-ui` | `industrial-brutalist-ui/SKILL.md` | Swiss print + terminal/military dashboard aesthetic, rigid grids |
| `stitch-design-taste` | `stitch-design-taste/SKILL.md` | Semantic `DESIGN.md` design-system authoring for Google Stitch |
| `imagegen-frontend-web` | `imagegen-frontend-web/SKILL.md` | Section-by-section, conversion-aware website design reference images |
| `imagegen-frontend-mobile` | `imagegen-frontend-mobile/SKILL.md` | Premium mobile app screen and flow concept image generation |

---

### 4. Brand & Generative Media (8 Skills)

| Skill | Path | What it knows / does |
|---|---|---|
| `brandkit` | `brandkit/SKILL.md` | Premium brand boards, identity systems, logo directions, visual worlds |
| `brandbook-builder-v1.1` | `brandbook-builder-v1.1/SKILL.md` | Complete multi-section corporate brand guidelines and identity decks |
| `image-gen` | `image-gen/SKILL.md` | Gemini/Nano Banana image generation and iterative editing |
| `veo-video-gen` | `veo-video-gen/SKILL.md` | Gemini Veo video generation, extension, first/last frame workflows |
| `veo` | `veo/SKILL.md` | Alternative Google Veo 3.1 / 3.0 generation runtime |
| `kling-video-gen` | `kling-video-gen/SKILL.md` | Kling AI text/image-to-video, camera control, and transition workflows |
| `fashion-product-video-gen` | `fashion-product-video-gen/SKILL.md` | Luxury fashion e-commerce video (fabric physics, 9:16 framing, closed loops) |
| `natural-product-video-gen` | `natural-product-video-gen/SKILL.md` | Artisanal, botanical oils, ceramics, textiles, and craft product videos |

---

### 5. Media Intelligence, Documents & Publishing (7 Skills)

| Skill | Path | What it knows / does |
|---|---|---|
| `transcribe-media` | `transcribe-media/SKILL.md` | Audio/video transcription, entity extraction, speaker diarization, and web studio |
| `publication-designer` | `publication-designer/SKILL.md` | Print-quality books, reports, magazines, workbooks, layout QA |
| `pandoc-typesetting` | `pandoc-typesetting/SKILL.md` | Structural Markdown-to-PDF document conversion with professional typesetting |
| `puppeteer-pdf` | `puppeteer-pdf/SKILL.md` | Browser-based HTML/CSS to print-ready PDF workflows |
| `stop-slop` | `stop-slop/SKILL.md` | Editing prose to remove predictable AI writing patterns |
| `caveman` | `caveman/SKILL.md` | Token-efficient, compressed but technically accurate communication mode |
| `iyi-turkce-skill` | `iyi-turkce-skill/SKILL.md` | Idiomatic, high-clarity Turkish language writing and translation |

---

### 6. Conductor, Governance & Operations (8 Skills)

| Skill | Path | What it knows / does |
|---|---|---|
| `conductor-setup` | `conductor-setup/SKILL.md` | Establishing a Conductor project environment |
| `conductor-newTrack` | `conductor-newTrack/SKILL.md` | Creating feature/bug tracks, specifications and implementation plans |
| `conductor-implement` | `conductor-implement/SKILL.md` | Executing a defined Conductor track plan |
| `conductor-review` | `conductor-review/SKILL.md` | Reviewing completed work against plan and project standards |
| `conductor-revert` | `conductor-revert/SKILL.md` | Git-aware reversal of Conductor-scoped work |
| `conductor-status` | `conductor-status/SKILL.md` | Reading and summarizing tracked project progress |
| `vulnerability-scanner` | `vulnerability-scanner/SKILL.md` | Static, dependency, and configuration vulnerability/CVE scans |
| `session-handoff` | `session-handoff/SKILL.md` | Comprehensive handoff documents for seamless AI agent session transfers |

---

### 7. Commerce, AI Discovery & Compliance (3 Skills)

| Skill | Path | What it knows / does |
|---|---|---|
| `ai-discovery-marketability-skill` | `ai-discovery-marketability-skill/SKILL.md` | SEO, retrieval optimization, citation readiness, agentic buying transaction paths |
| `marketing-optimizer` | `marketing-optimizer/SKILL.md` | Premium commerce funnels, positioning, buyer-risk models, conversion UX |
| `turkey-ecommerce-compliance-skill` | `turkey-ecommerce-compliance-skill/SKILL.md` | Türkiye consumer/ecommerce, advertising, privacy/cookies, product safety |
