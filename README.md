# Shared AI Agent Skills & Plugins

A modular collection of **72 production-grade AI agent skills** organized into **7 native Antigravity Plugin Bundles** compatible with **Google Antigravity, Gemini CLI, OpenAI Codex, and Anthropic Claude Code**.

---

## Plugin Architecture

```
shared-skills/                          <- Submodule root (.agents/plugins/)
├── SKILLS.md                           <- Master categorized taxonomy & fast router
├── README.md                           <- This file
├── install.py / install.sh             <- Universal plugin installer & conflict resolver
├── .gitignore
│
├── 3d-threejs/                         <- 3D & Procedural Graphics Bundle (24 skills)
│   ├── plugin.json
│   └── skills/
│       ├── threejs-bloom/SKILL.md
│       └── ...
│
├── frontend-experience/                <- Frontend & Performance Bundle (11 skills)
│   ├── plugin.json
│   └── skills/
│       ├── design-taste-frontend/SKILL.md
│       └── ...
│
├── ui-design-systems/                  <- Visual Systems Bundle (7 skills)
│   ├── plugin.json
│   └── skills/
│       ├── gpt-taste/SKILL.md
│       └── ...
│
├── brand-generative-media/             <- Brand & Video Generation Bundle (8 skills)
│   ├── plugin.json
│   └── skills/
│       ├── brandbook-builder-v1.1/SKILL.md
│       └── ...
│
├── media-intelligence-docs/            <- Media Intelligence & Publishing Bundle (7 skills)
│   ├── plugin.json
│   └── skills/
│       ├── transcribe-media/SKILL.md
│       └── ...
│
├── conductor-governance/               <- Conductor & Operations Bundle (8 skills)
│   ├── plugin.json
│   └── skills/
│       ├── conductor-implement/SKILL.md
│       └── ...
│
└── commerce-marketability/             <- Commerce & AI Discovery Bundle (3 skills)
    ├── plugin.json
    └── skills/
        ├── ai-discovery-marketability-skill/SKILL.md
        └── ...
```

---

## Quickstart

### Submodule in Any Workspace (Recommended)
Mount this repository directly into `.agents/plugins`:

```bash
git submodule add git@github.com:menguzat/shared-skills.git .agents/plugins
```

Antigravity natively discovers all 7 plugins and registers their skills automatically.

---

## License

Private / Proprietary — lyflab.
