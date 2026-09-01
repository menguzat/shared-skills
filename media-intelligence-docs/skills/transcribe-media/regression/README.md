# Media Regression Fixtures

Fixtures reference immutable media already present in the workspace; they do not duplicate large binaries. Live run artifacts are stored under `data/regression-runs/<fixture-id>/<run-id>/`, with an immutable `run.json`, every transcript attempt, and a `latest.json` pointer.

The primary live fixture is `oldskool-2026-07-23-cem-mengu`, backed by `oldskool/conversations/2026-07-23-cem-mengu.mp3` (4090.5665 seconds). A passing run must satisfy both transcript gates before any configured analysis style is tested.

Small baseline summaries in `baselines/` are tracked for cross-machine comparison. Full transcripts and live run artifacts stay local because they may contain private conversation content and are ignored with the rest of `data/`.
