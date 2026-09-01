# Rebuild capsule

A release PDF is distribution evidence; a rebuild capsule is recovery
evidence. It preserves enough bounded source state to rebuild, audit, or edit
the released edition after temporary runs are removed.

Create the capsule only after final QA and manual review close, and before
offering workspace cleanup. It must be immutable once its manifest is written.

## Minimum contents

- exact `publication.json` and its checksum;
- canonical input/source files and project-local renderer/style files;
- art direction, content map, editorial preflight review, and source copy;
- every referenced asset and generated-asset manifest;
- exact prompt records and reference-image provenance for generated assets;
- lockfile and renderer/skill version record where available;
- final QA, PDF preflight, parity, manual-review, and release-decision evidence;
- final `output.pdf` checksum.

Never include credentials, `.env`, raw model requests carrying private source
material, `node_modules`, browser caches, or unrelated workspace files.

## Manifest

`capsule-manifest.json` has a SHA-256 and byte count for every copied regular
file. Paths are relative to the declared project root. Roles make recovery
intent inspectable: `config`, `source`, `input`, `asset`, `asset-manifest`,
`prompt`, `evidence`, `pdf`, or `lockfile`.

Build and verify:

```sh
node <skill>/scripts/create-rebuild-capsule.mjs \
  --project-root /absolute/path/to/publication \
  --config /absolute/path/to/publication/publication.json \
  --run /absolute/path/to/publication/runs/final-01 \
  --out /absolute/path/to/publication/rebuild-capsule \
  --include index.html --include content.js --include styles.css \
  --include docs --include assets --include asset-manifest.json \
  --role asset-manifest:asset-manifest.json \
  --role prompt:docs/prompts --role lockfile:package-lock.json

node <skill>/scripts/verify-rebuild-capsule.mjs \
  --capsule /absolute/path/to/publication/rebuild-capsule
```

The current scripts are standalone migration tools. Promotion should later
invoke them in its staging directory and refuse cleanup advice without a
passing capsule verification.
