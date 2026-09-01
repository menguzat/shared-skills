---
name: stop-slop
description: Remove AI writing patterns from prose. Use when drafting, editing, or reviewing text to eliminate predictable AI tells.
metadata:
  trigger: Writing prose, editing drafts, reviewing content for AI patterns
  author: Hardik Pandya (https://hvpandya.com) & Research-Enhanced
---

# Stop Slop

Eliminate predictable AI writing patterns from prose. Make text undetectable, human, and punchy.

## Core Rules

1.  **Cut "Throat-Clearing" & Filler.**
    *   **Ban these phrases:** "In conclusion," "It is important to note," "It is worth noting," "Furthermore," "Moreover," "In summary," "Aims to."
    *   **Ban these "AI tell" words:** "Delve," "Tapestry," "Testament," "Landscape," "Foster," "Spearhead."
    *   **See [references/phrases.md](references/phrases.md) for the full blacklist.**
    *   **Action:** Delete the first sentence of every paragraph. Does it still make sense? If yes, keep it deleted.

2.  **Maximize Burstiness & Perplexity.**
    *   **Vary Rhythm:** Do not use consistent sentence lengths. Mix very short fragments with longer, complex sentences.
    *   **Break Patterns:** If you see three sentences in a row with the same structure (e.g., Subject-Verb-Object), rewrite two of them.
    *   **No Lists:** Avoid "First, Second, Finally" structures unless absolutely necessary for technical instructions.
    *   **See [references/structures.md](references/structures.md) for structural fixes.**

3.  **Trust Readers (No Hand-Holding).**
    *   **Directness:** State facts directly. "The server failed." NOT "It is generally considered that the server may have failed."
    *   **No Hedging:** Remove "It seems," "Likely," "Potentially," "Can be seen as." Make a claim or don't.
    *   **No Moralizing:** Remove "It is crucial to remember," "We must ensure."

4.  **Authenticity & Voice.**
    *   **Role-Play:** "Act as a specific expert/persona, not an AI assistant."
    *   **Active Voice:** "The team built the app." NOT "The app was built by the team."
    *   **Concrete Details:** Use specific, sensory, or technical details that an AI wouldn't hallucinate (e.g., specific version numbers, real-world analogies).

## Advanced Strategy: The Critique Loop

For best results, use a **Prompt Chain**:
1.  **Draft:** Generate the initial text.
2.  **Critique:** Ask: "Identify every instance of passive voice, hedging, 'delving', and 'throat-clearing' in the text above."
3.  **Rewrite:** "Rewrite the text to remove all identified issues. Increase burstiness. Use a conversational but professional tone."

## Quick Checks

Before delivering prose:
- [ ] Does it start with "Here is..." or "Certainly..."? **Delete it.**
- [ ] Does it contain "delve" or "tapestry"? **Rewrite it.**
- [ ] Are there 3+ sentences of similar length in a row? **Break the rhythm.**
- [ ] Is the tone "helpful assistant" or "expert peer"? **Enforce peer tone.**

## Scoring

Rate 1-10 on each dimension:

| Dimension | Question |
|-----------|----------|
| **Directness** | Statements or announcements? |
| **Rhythm** | Varied or metronomic? |
| **Trust** | Respects reader intelligence? |
| **Vocabulary** | Natural or "SAT words" (delve/tapestry)? |
| **Density** | Anything cuttable? |

**Below 40/50: revise.**
See [references/examples.md](references/examples.md) for before/after transformations.
## License

MIT
