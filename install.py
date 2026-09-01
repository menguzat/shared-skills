#!/usr/bin/env python3
"""
Universal AI Agent Skills Installer
Compatible with Antigravity, Gemini CLI, OpenAI Codex, and Anthropic Claude Code.

Handles:
1. Target environment detection (Workspace .agents/skills, Global ~/.gemini/config/skills, or Custom path)
2. Conflict resolution (Overwrite, Symlink, Keep existing & adjust inventory)
3. Tailored SKILLS.md routing generation
4. Automatic integration into AGENTS.md, CLAUDE.md, and GEMINI.md
"""

import os
import sys
import shutil
import argparse

DOMAIN_MAPPING = {
    # 3D & Procedural Three.js (24)
    'threejs-atmosphere-aerial-perspective': '3D & Procedural Three.js',
    'threejs-bloom': '3D & Procedural Three.js',
    'threejs-camera-direction': '3D & Procedural Three.js',
    'threejs-exposure-color-grading': '3D & Procedural Three.js',
    'threejs-image-pipeline': '3D & Procedural Three.js',
    'threejs-parallax-occlusion-mapping': '3D & Procedural Three.js',
    'threejs-precipitation-surfaces': '3D & Procedural Three.js',
    'threejs-procedural-animation': '3D & Procedural Three.js',
    'threejs-procedural-architecture': '3D & Procedural Three.js',
    'threejs-procedural-fields': '3D & Procedural Three.js',
    'threejs-procedural-geometry': '3D & Procedural Three.js',
    'threejs-procedural-materials': '3D & Procedural Three.js',
    'threejs-procedural-planets': '3D & Procedural Three.js',
    'threejs-procedural-vegetation': '3D & Procedural Three.js',
    'threejs-procedural-vfx': '3D & Procedural Three.js',
    'threejs-raymarched-space-effects': '3D & Procedural Three.js',
    'threejs-screen-space-ambient-occlusion': '3D & Procedural Three.js',
    'threejs-shadow-systems': '3D & Procedural Three.js',
    'threejs-skill-router': '3D & Procedural Three.js',
    'threejs-spectral-ocean': '3D & Procedural Three.js',
    'threejs-temporal-surfaces': '3D & Procedural Three.js',
    'threejs-visual-validation': '3D & Procedural Three.js',
    'threejs-volumetric-clouds': '3D & Procedural Three.js',
    'threejs-water-optics': '3D & Procedural Three.js',

    # Frontend Experience & Performance (11)
    'design-taste-frontend': 'Frontend Experience & Performance',
    'frontend-tdd-flow': 'Frontend Experience & Performance',
    'full-output-enforcement': 'Frontend Experience & Performance',
    'image-to-code': 'Frontend Experience & Performance',
    'landing-page': 'Frontend Experience & Performance',
    'lighthouse-performance-maximizer': 'Frontend Experience & Performance',
    'minimalist': 'Frontend Experience & Performance',
    'mobile-adaptive-ux-skill': 'Frontend Experience & Performance',
    'redesign-existing-projects': 'Frontend Experience & Performance',
    'scroll-world': 'Frontend Experience & Performance',
    'agent-native-app-architecture': 'Frontend Experience & Performance',

    # UI Design Systems (7)
    'gpt-taste': 'UI Design Systems',
    'high-end-visual-design': 'UI Design Systems',
    'imagegen-frontend-mobile': 'UI Design Systems',
    'imagegen-frontend-web': 'UI Design Systems',
    'industrial-brutalist-ui': 'UI Design Systems',
    'minimalist-ui': 'UI Design Systems',
    'stitch-design-taste': 'UI Design Systems',

    # Brand & Generative Media (10)
    'brandbook-builder-v1.1': 'Brand & Generative Media',
    'brandkit': 'Brand & Generative Media',
    'fashion-product-video-gen': 'Brand & Generative Media',
    'goksen-post-uret': 'Brand & Generative Media',
    'image-gen': 'Brand & Generative Media',
    'kling-video-gen': 'Brand & Generative Media',
    'mengu-image-gen': 'Brand & Generative Media',
    'natural-product-video-gen': 'Brand & Generative Media',
    'veo': 'Brand & Generative Media',
    'veo-video-gen': 'Brand & Generative Media',

    # Media Intelligence & Publishing (7)
    'caveman': 'Media Intelligence & Publishing',
    'iyi-turkce-skill': 'Media Intelligence & Publishing',
    'pandoc-typesetting': 'Media Intelligence & Publishing',
    'publication-designer': 'Media Intelligence & Publishing',
    'puppeteer-pdf': 'Media Intelligence & Publishing',
    'stop-slop': 'Media Intelligence & Publishing',
    'transcribe-media': 'Media Intelligence & Publishing',

    # Conductor, Delivery & Operations (10)
    'conductor-implement': 'Conductor, Delivery & Operations',
    'conductor-newTrack': 'Conductor, Delivery & Operations',
    'conductor-revert': 'Conductor, Delivery & Operations',
    'conductor-review': 'Conductor, Delivery & Operations',
    'conductor-setup': 'Conductor, Delivery & Operations',
    'conductor-status': 'Conductor, Delivery & Operations',
    'deploy-first-app': 'Conductor, Delivery & Operations',
    'deploy-update-app': 'Conductor, Delivery & Operations',
    'session-handoff': 'Conductor, Delivery & Operations',
    'vulnerability-scanner': 'Conductor, Delivery & Operations',

    # Commerce, AI Discovery & Compliance (3)
    'ai-discovery-marketability-skill': 'Commerce, AI Discovery & Compliance',
    'marketing-optimizer': 'Commerce, AI Discovery & Compliance',
    'turkey-ecommerce-compliance-skill': 'Commerce, AI Discovery & Compliance'
}

ROUTING_BLOCK = """
# Project-Wide Skill Routing

Before starting any request that is more substantial than a simple edit or basic operation, you MUST read the skill index at `.agents/skills/SKILLS.md`. Use its fast router and knowledge inventory to decide whether one or more project skills are relevant.

Examples that require checking the skill inventory:
- Frontend architecture, design systems, visual polish, and performance
- 3D graphics, procedural Three.js, shaders, and visual validation
- Brand assets, media generation (image/video/audio), and identity systems
- Document typesetting, publishing, audio/video transcription, and analysis
- Conductor tracks, deployment pipelines, vulnerability scans, and handoffs
- E-commerce audits, AI discovery, and compliance

After checking the inventory:
1. Select the smallest set of skills that directly fits the request.
2. Read each selected skill's `SKILL.md` completely before acting.
3. Follow the selected skill's workflow and referenced instructions.
"""

def get_repo_skills(repo_root):
    skills = {}
    for item in sorted(os.listdir(repo_root)):
        p = os.path.join(repo_root, item)
        if os.path.isdir(p) and not item.startswith('.'):
            skill_md = os.path.join(p, 'SKILL.md')
            if os.path.isfile(skill_md):
                desc = ''
                try:
                    with open(skill_md, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                    in_fm = False
                    for line in lines:
                        if line.strip() == '---':
                            in_fm = not in_fm
                            continue
                        if in_fm and line.startswith('description:'):
                            desc = line.split('description:', 1)[1].strip().strip('\"\'')
                            break
                        if not in_fm and line.startswith('# '):
                            desc = line[2:].strip()
                            break
                except Exception:
                    pass
                domain = DOMAIN_MAPPING.get(item, 'Specialist Skills')
                skills[item] = {
                    'name': item,
                    'path': p,
                    'desc': desc or 'Specialist skill workflow',
                    'domain': domain
                }
    return skills

def detect_default_target():
    cwd = os.getcwd()
    # Check if inside a repo with .agents
    agents_dir = os.path.join(cwd, '.agents')
    if os.path.isdir(agents_dir):
        return os.path.join(agents_dir, 'skills'), cwd
    # If in repo root
    if os.path.isdir(os.path.join(cwd, '.git')):
        return os.path.join(cwd, '.agents', 'skills'), cwd
    # Global fallback
    home = os.path.expanduser('~')
    global_skills = os.path.join(home, '.gemini', 'config', 'skills')
    return global_skills, cwd

def ask_user_conflict(skill_name, existing_path, default_action=None):
    if default_action:
        return default_action
    print(f"\n[!] CONFLICT: Skill '{skill_name}' already exists at:")
    print(f"    {existing_path}")
    print("    [O]verwrite (replace with repo version)")
    print("    [S]ymlink (create link to repo version)")
    print("    [K]eep (preserve existing version, omit repo version)")
    print("    [A]ll (apply choice to all remaining conflicts)")
    while True:
        choice = input("    Choose action [o/s/k/a]: ").strip().lower()
        if choice in ['o', 'overwrite']:
            return 'overwrite'
        elif choice in ['s', 'symlink']:
            return 'symlink'
        elif choice in ['k', 'keep']:
            return 'keep'
        elif choice in ['a', 'all']:
            sub = input("    Apply which action to ALL remaining? [o/s/k]: ").strip().lower()
            if sub in ['o', 'overwrite']:
                return 'all-overwrite'
            elif sub in ['s', 'symlink']:
                return 'all-symlink'
            elif sub in ['k', 'keep']:
                return 'all-keep'
        print("    Invalid selection. Please choose o, s, k, or a.")

def install():
    parser = argparse.ArgumentParser(description="Universal AI Agent Skills Installer")
    parser.add_argument('--target', type=str, help="Target skills directory path")
    parser.add_argument('--global', dest='is_global', action='store_true', help="Install to global ~/.gemini/config/skills")
    parser.add_argument('--mode', choices=['copy', 'symlink'], default='copy', help="Installation mode (copy or symlink)")
    parser.add_argument('--on-conflict', choices=['overwrite', 'symlink', 'keep', 'prompt'], default='prompt', help="Action on conflict")
    parser.add_argument('--no-instructions', action='store_true', help="Skip updating AGENTS.md, CLAUDE.md, GEMINI.md")
    parser.add_argument('--dry-run', action='store_true', help="Simulate installation without modifying disk")
    args = parser.parse_args()

    repo_root = os.path.dirname(os.path.abspath(__file__))
    repo_skills = get_repo_skills(repo_root)

    print(f"=== Universal AI Agent Skills Installer ===")
    print(f"Found {len(repo_skills)} production skills in repository.")

    if args.is_global:
        target_dir = os.path.expanduser('~/.gemini/config/skills')
        workspace_root = None
    elif args.target:
        target_dir = os.path.abspath(args.target)
        workspace_root = os.path.dirname(os.path.dirname(target_dir)) if '.agents' in target_dir else os.path.dirname(target_dir)
    else:
        target_dir, workspace_root = detect_default_target()

    print(f"Target Directory: {target_dir}")
    if args.dry_run:
        print("[DRY-RUN MODE ACTIVE] No files will be modified.")

    if not args.dry_run:
        os.makedirs(target_dir, exist_ok=True)

    default_action = None
    if args.on_conflict == 'overwrite':
        default_action = 'overwrite'
    elif args.on_conflict == 'symlink':
        default_action = 'symlink'
    elif args.on_conflict == 'keep':
        default_action = 'keep'

    installed_skills = []
    kept_skills = []
    skipped_skills = []

    for name, info in repo_skills.items():
        src_path = info['path']
        dest_path = os.path.join(target_dir, name)

        action = args.mode  # 'copy' or 'symlink'

        if os.path.exists(dest_path):
            conflict_res = ask_user_conflict(name, dest_path, default_action)
            if conflict_res.startswith('all-'):
                default_action = conflict_res.split('all-')[1]
                conflict_res = default_action

            if conflict_res == 'overwrite':
                action = 'copy'
            elif conflict_res == 'symlink':
                action = 'symlink'
            elif conflict_res == 'keep':
                print(f"  [-] Keeping existing: {name}")
                kept_skills.append(name)
                continue

        # Execute install
        if not args.dry_run:
            if os.path.islink(dest_path) or os.path.isfile(dest_path):
                os.remove(dest_path)
            elif os.path.isdir(dest_path):
                shutil.rmtree(dest_path)

            if action == 'symlink':
                os.symlink(src_path, dest_path)
                print(f"  [S] Symlinked: {name} -> {src_path}")
            else:
                shutil.copytree(src_path, dest_path)
                print(f"  [+] Installed: {name}")

        installed_skills.append(name)

    # Generate localized SKILLS.md in target_dir
    skills_md_path = os.path.join(target_dir, 'SKILLS.md')
    if not args.dry_run:
        # Copy base SKILLS.md
        repo_skills_md = os.path.join(repo_root, 'SKILLS.md')
        if os.path.isfile(repo_skills_md):
            shutil.copy(repo_skills_md, skills_md_path)
            print(f"\n[V] Generated localized SKILLS.md at {skills_md_path}")

    # Update instruction files if in workspace
    if workspace_root and not args.no_instructions and not args.dry_run:
        update_instruction_files(workspace_root)

    print("\n=== Installation Summary ===")
    print(f"  Total Skills Installed/Updated: {len(installed_skills)}")
    print(f"  Existing Skills Kept Untouched: {len(kept_skills)}")
    print(f"  Target: {target_dir}")
    print("[V] All agents (Antigravity, Codex, Claude Code, Gemini) are ready to use these skills!")

def update_instruction_files(workspace_root):
    files = {
        'AGENTS.md': 'Master multi-agent routing instructions',
        'CLAUDE.md': 'Claude Code configuration and routing',
        'GEMINI.md': 'Gemini CLI & Antigravity workspace rules'
    }

    for filename, desc in files.items():
        filepath = os.path.join(workspace_root, filename)
        if os.path.isfile(filepath):
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            if 'Project-Wide Skill Routing' not in content and 'SKILLS.md' not in content:
                with open(filepath, 'a', encoding='utf-8') as f:
                    f.write("\n\n" + ROUTING_BLOCK.strip() + "\n")
                print(f"  [+] Appended skill routing to existing {filename}")
            else:
                print(f"  [=] {filename} already contains skill routing rules")
        else:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"# {filename} - {desc}\n\n" + ROUTING_BLOCK.strip() + "\n")
            print(f"  [+] Created {filename} with skill routing rules")

if __name__ == '__main__':
    install()
