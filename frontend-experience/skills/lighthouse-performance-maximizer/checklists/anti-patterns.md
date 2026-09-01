# Critical Anti-Patterns

Fail the solution if it relies on:

- Lighthouse user-agent detection or benchmark-specific content;
- removing required product functionality for score;
- hiding content until after measurement;
- disabling consent/payment/auth only in audit builds;
- reporting only the best run;
- claiming Lighthouse TBT is field INP;
- mass-preloading resources without waterfall evidence;
- lazy-loading the LCP image;
- removing accessibility semantics to reduce DOM;
- low-quality image substitution that violates product requirements;
- changing mutable content to immutable caching without invalidation;
- large multi-cause patch batches that cannot be attributed;
- retaining a patch that fails regression gates merely because score rises.
