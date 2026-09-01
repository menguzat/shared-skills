# Decision-Boundary Protocol

Purpose: estimate which user constraint changes are associated with a target entering or leaving recommendations.

1. Start with a brand-neutral base query.
2. Create a lattice of single-dimension changes.
3. Keep wording/length as similar as practical.
4. Repeat each condition across multiple paraphrases and runs.
5. Record all competing recommendations.
6. Identify candidate boundary dimensions (e.g. custom sizing, budget, shipping, material).
7. Verify that the target actually satisfies the winning condition on the public site.
8. Use holdout combinations to check whether the boundary generalizes.
9. Do not infer hidden model weights; report only observed conditional behavior.

Output example:

| Constraint | Target  / runs | Delta vs base | Interpretation |
|---|---:|---:|---|
| base | 1/15 | — | weak baseline |
| + custom sizing | 11/15 | +10 | strong observed association |
| + under €250 | 0/15 | -1 | target likely disqualified |
