#!/usr/bin/env python3
"""
Universal AI Agent Skills & Plugins Installer
=============================================
Installs and configures shared skills across Google Antigravity, Gemini CLI,
OpenAI Codex, and Anthropic Claude Code.

Supports:
- 7 Native Antigravity Plugin Bundles (.agents/plugins/ or ~/.gemini/config/plugins/)
- Standalone flat skills target (.agents/skills/ or ~/.gemini/config/skills/)
- Interactive and automated conflict resolution ([O]verwrite, [S]ymlink, [K]eep)
- Workspace instruction updates (AGENTS.md, CLAUDE.md, GEMINI.md)
"""

import os
import sys
import shutil
import argparse
import json

ROUTING_BLOCK = """
# Project-Wide Skill Routing

These instructions apply to every coding agent working in this project.

Before starting any request that is more substantial than a simple edit or basic operation, you MUST read `.agents/SKILLS.md` (or `.agents/plugins/SKILLS.md`). Use its fast router and knowledge inventory to decide whether one or more project skills are relevant.

After checking the inventory:
1. Select the smallest set of skills that directly fits the request.
2. Read each selected skill's `SKILL.md` completely before acting.
3. Follow the selected skill's workflow and referenced instructions.
"""

def discover_repo_structure(repo_root):
    """
    Scans repository for both plugin bundles and individual skills.
    Returns:
      plugins: { plugin_id: { 'path': ..., 'manifest': ..., 'skills': { skill_id: { ... } } } }
      flat_skills: { skill_id: { 'name': ..., 'path': ..., 'desc': ..., 'plugin': ... } }
    """
    plugins = {}
    flat_skills = {}

    for item in sorted(os.listdir(repo_root)):
        plugin_path = os.path.join(repo_root, item)
        manifest_path = os.path.join(plugin_path, 'plugin.json')
        skills_subdir = os.path.join(plugin_path, 'skills')

        if os.path.isdir(plugin_path) and os.path.isfile(manifest_path) and os.path.isdir(skills_subdir):
            manifest = {}
            try:
                with open(manifest_path, 'r', encoding='utf-8') as mf:
                    manifest = json.load(mf)
            except Exception:
                pass

            p_skills = {}
            for s_name in sorted(os.listdir(skills_subdir)):
                s_path = os.path.join(skills_subdir, s_name)
                skill_md = os.path.join(s_path, 'SKILL.md')
                if os.path.isdir(s_path) and os.path.isfile(skill_md):
                    desc = extract_description(skill_md)
                    skill_info = {
                        'name': s_name,
                        'path': s_path,
                        'desc': desc,
                        'plugin': item
                    }
                    p_skills[s_name] = skill_info
                    flat_skills[s_name] = skill_info

            plugins[item] = {
                'name': item,
                'path': plugin_path,
                'manifest': manifest,
                'skills': p_skills
            }

    return plugins, flat_skills

def extract_description(skill_md):
    desc = ""
    try:
        with open(skill_md, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        in_fm = False
        for line in lines:
            if line.strip() == '---':
                in_fm = not in_fm
                continue
            if in_fm and line.startswith('description:'):
                desc = line.split('description:', 1)[1].strip().strip('"\'')
                break
            if not in_fm and line.startswith('# '):
                desc = line[2:].strip()
                break
    except Exception:
        pass
    return desc or "Specialist skill workflow"

def detect_default_target():
    cwd = os.getcwd()
    agents_dir = os.path.join(cwd, '.agents')
    if os.path.isdir(agents_dir):
        return os.path.join(agents_dir, 'plugins'), 'plugins', cwd
    if os.path.isdir(os.path.join(cwd, '.git')):
        return os.path.join(cwd, '.agents', 'plugins'), 'plugins', cwd
    
    # Global fallback
    home = os.path.expanduser('~')
    return os.path.join(home, '.gemini', 'config', 'plugins'), 'plugins', cwd

def ask_user_conflict(item_type, item_name, existing_path, default_action=None):
    if default_action:
        return default_action
    print(f"\n[!] CONFLICT: {item_type} '{item_name}' already exists at:")
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
    parser = argparse.ArgumentParser(description="Universal AI Agent Skills & Plugins Installer")
    parser.add_argument('--target', type=str, help="Target installation directory path")
    parser.add_argument('--as-plugins', action='store_true', help="Install as categorized plugin bundles (default)")
    parser.add_argument('--as-flat-skills', action='store_true', help="Install as flat skills directory")
    parser.add_argument('--global', dest='is_global', action='store_true', help="Install to global ~/.gemini/config")
    parser.add_argument('--mode', choices=['copy', 'symlink'], default='copy', help="Installation mode (copy or symlink)")
    parser.add_argument('--on-conflict', choices=['overwrite', 'symlink', 'keep', 'prompt'], default='prompt', help="Action on conflict")
    parser.add_argument('--no-instructions', action='store_true', help="Skip updating AGENTS.md, CLAUDE.md, GEMINI.md")
    parser.add_argument('--dry-run', action='store_true', help="Simulate installation without modifying disk")
    args = parser.parse_args()

    repo_root = os.path.dirname(os.path.abspath(__file__))
    plugins, flat_skills = discover_repo_structure(repo_root)

    print(f"=== Universal AI Agent Skills & Plugins Installer ===")
    print(f"Found {len(plugins)} Plugin Bundles containing {len(flat_skills)} Production Skills.")

    # Determine target layout
    if args.as_flat_skills:
        layout = 'skills'
    else:
        layout = 'plugins'

    if args.is_global:
        home = os.path.expanduser('~')
        target_dir = os.path.join(home, '.gemini', 'config', layout)
        workspace_root = None
    elif args.target:
        target_dir = os.path.abspath(args.target)
        workspace_root = os.path.dirname(os.path.dirname(target_dir)) if '.agents' in target_dir else os.path.dirname(target_dir)
    else:
        target_dir, layout, workspace_root = detect_default_target()
        if args.as_flat_skills:
            target_dir = target_dir.replace('plugins', 'skills')
            layout = 'skills'

    print(f"Layout: {'Categorized Plugin Bundles' if layout == 'plugins' else 'Flat Skills'}")
    print(f"Target Directory: {target_dir}")
    if args.dry_run:
        print("[DRY-RUN MODE ACTIVE] No files will be modified.")

    if not args.dry_run:
        os.makedirs(target_dir, exist_ok=True)

    default_action = None
    if args.on_conflict in ['overwrite', 'symlink', 'keep']:
        default_action = args.on_conflict

    installed_items = []
    kept_items = []

    if layout == 'plugins':
        # Install as Plugin Bundles
        for p_name, p_info in plugins.items():
            src_path = p_info['path']
            dest_path = os.path.join(target_dir, p_name)
            action = args.mode

            if os.path.exists(dest_path):
                conflict_res = ask_user_conflict('Plugin', p_name, dest_path, default_action)
                if conflict_res.startswith('all-'):
                    default_action = conflict_res.split('all-')[1]
                    conflict_res = default_action

                if conflict_res == 'overwrite':
                    action = 'copy'
                elif conflict_res == 'symlink':
                    action = 'symlink'
                elif conflict_res == 'keep':
                    print(f"  [-] Keeping existing: {p_name}")
                    kept_items.append(p_name)
                    continue

            if not args.dry_run:
                if os.path.islink(dest_path) or os.path.isfile(dest_path):
                    os.remove(dest_path)
                elif os.path.isdir(dest_path):
                    shutil.rmtree(dest_path)

                if action == 'symlink':
                    os.symlink(src_path, dest_path)
                    print(f"  [S] Symlinked Plugin: {p_name} ({len(p_info['skills'])} skills)")
                else:
                    shutil.copytree(src_path, dest_path)
                    print(f"  [+] Installed Plugin: {p_name} ({len(p_info['skills'])} skills)")

            installed_items.append(p_name)
    else:
        # Install as Flat Skills
        for s_name, s_info in flat_skills.items():
            src_path = s_info['path']
            dest_path = os.path.join(target_dir, s_name)
            action = args.mode

            if os.path.exists(dest_path):
                conflict_res = ask_user_conflict('Skill', s_name, dest_path, default_action)
                if conflict_res.startswith('all-'):
                    default_action = conflict_res.split('all-')[1]
                    conflict_res = default_action

                if conflict_res == 'overwrite':
                    action = 'copy'
                elif conflict_res == 'symlink':
                    action = 'symlink'
                elif conflict_res == 'keep':
                    print(f"  [-] Keeping existing: {s_name}")
                    kept_items.append(s_name)
                    continue

            if not args.dry_run:
                if os.path.islink(dest_path) or os.path.isfile(dest_path):
                    os.remove(dest_path)
                elif os.path.isdir(dest_path):
                    shutil.rmtree(dest_path)

                if action == 'symlink':
                    os.symlink(src_path, dest_path)
                    print(f"  [S] Symlinked Skill: {s_name}")
                else:
                    shutil.copytree(src_path, dest_path)
                    print(f"  [+] Installed Skill: {s_name}")

            installed_items.append(s_name)

    # Localized SKILLS.md
    if not args.dry_run:
        skills_md_path = os.path.join(target_dir, 'SKILLS.md')
        repo_skills_md = os.path.join(repo_root, 'SKILLS.md')
        if os.path.isfile(repo_skills_md):
            shutil.copy(repo_skills_md, skills_md_path)
            print(f"\n[V] Generated localized SKILLS.md at {skills_md_path}")

    # Update instruction files if in workspace
    if workspace_root and not args.no_instructions and not args.dry_run:
        update_instruction_files(workspace_root)

    print("\n=== Installation Summary ===")
    print(f"  Total Items Installed/Updated: {len(installed_items)}")
    print(f"  Existing Items Kept Untouched: {len(kept_items)}")
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
