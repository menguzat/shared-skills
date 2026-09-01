# Retrieval vs Citation vs Recommendation

These stages must never be collapsed into “AI ranking.”

## Retrieval
Question: did a candidate enter the context/search result set?

Likely relevant mechanisms include query interpretation, index availability, semantic/lexical relevance, freshness, authority/quality systems, and engine-specific retrieval/reranking. Exact production algorithms are generally not public.

## Citation
Question: given available sources, which source is surfaced as support?

Controlled research can isolate citation preferences in fixed contexts. Such findings are useful for content/evidence design but cannot establish organic retrieval causality.

## Factual absorption
Question: did the answer actually use a fact/proposition from the source, whether or not the source was visually prominent?

Measure proposition-level fidelity when possible.

## Mention
Question: was the entity/brand named?

A mention can be positive, negative, incidental, or merely navigational. Do not treat every mention as recommendation.

## Recommendation
Question: did the system advise the user to choose/consider the entity/product?

Code recommendation stance explicitly:
- primary recommendation,
- alternative,
- conditional recommendation,
- neutral mention,
- warning/negative recommendation.

## Action
Question: could the user/agent navigate, contact, book, buy, or otherwise complete the task?

Operational data and UX become part of the recommendation-to-outcome bridge.
