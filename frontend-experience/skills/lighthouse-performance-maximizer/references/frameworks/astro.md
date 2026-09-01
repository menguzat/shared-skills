# Astro Notes

Astro can ship very little client JS, but integrations/islands can still create heavy startup work.

Inspect:

- hydration directives (`client:load`, `client:visible`, `client:idle`, etc.);
- large framework islands above fold;
- image pipeline;
- fonts;
- static vs server rendering;
- third parties.

Prefer the least eager hydration trigger consistent with required interaction.
