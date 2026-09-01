# AUDIT-ONLY Acceptance Checklist

- [ ] Mode explicitly says AUDIT-ONLY.
- [ ] No application source/config/content was modified.
- [ ] Representative route/template coverage is documented.
- [ ] Mobile and desktop are separated.
- [ ] Run count and evidence quality are stated.
- [ ] Report uses medians/distributions when repeated reports exist.
- [ ] Findings are root causes, not a copied Lighthouse Opportunities list.
- [ ] Every actionable finding has impact, effort, confidence, reach, reproducibility, risk, and priority.
- [ ] P0 Quick Wins satisfy the deterministic P0 criteria.
- [ ] Full list is ordered by priority bucket and priority score/tie-break rules.
- [ ] Do-not-bother/defer section explains low-value Lighthouse diagnostics.
- [ ] Score/metric frontier projections are clearly labeled estimates or omitted when unsupported.
- [ ] Every detailed finding includes a proposed fix and validation method.
- [ ] Repository-specific file/component references are verified rather than invented.
- [ ] Fix handoff is ordered and executable by another coding agent.
- [ ] Handoff instructs re-baselining after material fixes rather than blindly applying the entire queue.
