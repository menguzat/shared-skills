# Shared AI Agent Skills

A modular, zero-symlink collection of **72 production-grade AI agent skills** compatible with **Google Antigravity, Gemini CLI, OpenAI Codex, Anthropic Claude Code**, and other LLM agent runtimes.

---

## Installation & Setup

### 1. Interactive Installer (Recommended)
Clone this repository anywhere and run the automated installer:

```bash
# Interactive setup (workspace, global, or custom directory)
python3 install.py

# Or via bash wrapper
./install.sh
```

#### Installer Features:
- **Conflict Resolution**: If a skill already exists in the destination, the installer lets you **[O]verwrite**, **[S]ymlink**, or **[K]eep** the existing version (omitting it from the new installation).
- **Auto-Routing Configuration**: Automatically creates or updates `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` in your project root to ensure all coding agents consult `SKILLS.md`.
- **Custom Targets & Headless Modes**:
  ```bash
  # Install globally to ~/.gemini/config/skills
  python3 install.py --global

  # Install to custom path with overwrite
  python3 install.py --target /path/to/project/.agents/skills --on-conflict overwrite

  # Dry-run test
  python3 install.py --dry-run
  ```

### 2. Git Submodule Workflow (Direct Drop-in)
Add this repository as a submodule directly into your project's `.agents/skills` path:

```bash
git submodule add git@github.com:menguzat/shared-skills.git .agents/skills
```

---

## Directory Architecture

Every skill is self-contained in its own direct directory with zero symlinks:

```
shared-skills/
├── SKILLS.md                     <- Master categorized router & inventory (7 domains)
├── README.md                     <- This file
├── install.py / install.sh       <- Universal installer & conflict resolver
├── .gitignore
│
├── threejs-bloom/                <- 3D & Procedural Graphics (24 skills)
│   ├── SKILL.md
│   └── ...
├── design-taste-frontend/        <- Frontend Experience & TDD (11 skills)
│   ├── SKILL.md
│   └── ...
├── gpt-taste/                    <- UI Visual Systems (7 skills)
│   ├── SKILL.md
│   └── ...
├── brandkit/                     <- Brand & Generative Media (10 skills)
│   ├── SKILL.md
│   └── ...
├── transcribe-media/             <- Media Intelligence & Docs (7 skills)
│   ├── SKILL.md
│   ├── studio/                   <- Web studio application
│   └── media-analyzer/           <- TypeScript diarization & extraction engine
├── conductor-implement/          <- Conductor & Governance (10 skills)
│   ├── SKILL.md
│   └── ...
└── ai-discovery-marketability-skill/ <- Commerce & AI Discovery (3 skills)
    ├── SKILL.md
    └── ...
```

---

## Agent Compatibility Matrix

| Agent | Routing File | Skill Discovery |
|---|---|---|
| **Google Antigravity** | `GEMINI.md` / `SKILLS.md` | Auto-registers `.agents/skills/*/SKILL.md` |
| **OpenAI Codex** | `AGENTS.md` | Navigates via `.agents/skills/SKILLS.md` |
| **Anthropic Claude Code** | `CLAUDE.md` | Navigates via `.agents/skills/SKILLS.md` |
| **Cursor / Windsurf** | `.cursorrules` / `SKILLS.md` | Directly indexes flat skill folders |

---

## License

Private / Proprietary — lyflab.
