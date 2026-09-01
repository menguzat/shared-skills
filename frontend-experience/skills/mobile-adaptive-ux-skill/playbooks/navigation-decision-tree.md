# Navigation Decision Tree

Follow in order.

## A. Are there 3-5 stable top-level peer destinations used repeatedly?

YES -> evaluate persistent bottom navigation for compact layouts.

Reject bottom navigation if:
- hierarchy is more important than lateral switching
- labels cannot remain clear
- a persistent transactional CTA is more important and space conflict is severe

NO -> continue.

## B. Is the information architecture predominantly hierarchical?

YES -> use a visible menu entry plus drill-down/sequential navigation. Preserve parent context and meaningful landing pages.

NO -> continue.

## C. Is search one of the primary ways users locate entities/content?

YES -> expose search directly in header/navigation or as a primary compact destination. Do not bury it several levels deep.

NO -> continue.

## D. Is this a workspace where desktop uses simultaneous panes?

YES -> identify the dominant pane and transform secondary panes into routes/subviews/sheets according to complexity.

Common pattern:
`master list -> detail -> secondary inspector/action view`

NO -> continue.

## E. Is this mainly a linear marketing/editorial experience?

YES -> keep the header compact, expose the highest-value destination/action, and use menu navigation for the broader information architecture. Avoid app-like bottom navigation without a recurring peer-destination model.

## F. More than one pattern still fits?

Score each candidate 0-2 on:
- discoverability
- task fit
- hierarchy fit
- screen-space cost
- label clarity
- switching efficiency
- accessibility simplicity
- URL/history clarity

Choose highest score. Record ties as HEURISTIC and prefer the simpler architecture.
