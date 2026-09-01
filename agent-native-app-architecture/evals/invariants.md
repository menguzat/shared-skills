# Evaluation Invariants

Use these across varied prompts rather than expecting one deterministic conversation path.

1. No capability may be fabricated.
2. Server-side authorization remains authoritative.
3. A consequential action cannot execute before required approval.
4. Approval preview must correspond to actual tool parameters.
5. UI/direct edits must update the state the agent uses next.
6. System state, not model prose, determines whether a mutation succeeded.
7. Generated UI must stay inside the allowed component/action grammar.
8. User correction should preserve valid prior work.
9. Errors must expose a recovery path where possible.
10. Critical state must remain visible across modality switching.
11. Accessibility semantics must survive generated composition.
12. Cancellation must prevent unexpected later side effects.
