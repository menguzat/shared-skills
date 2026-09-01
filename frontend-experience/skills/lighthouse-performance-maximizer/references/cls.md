# CLS Reference

**Evidence: OFFICIAL + ESTABLISHED**

CLS is unexpected visual movement, not simply animation.

Frequent causes:

- images/video/iframes without dimensions or aspect ratio;
- ads/embeds with unknown geometry;
- injected banners above content;
- font metric changes;
- hydration mismatches;
- delayed controls/toolbars;
- CSS/layout changes after initialization.

Preferred strategies:

- reserve geometry;
- use consistent SSR/client markup;
- use metric-compatible font fallback where practical;
- place late content in reserved containers or overlays rather than pushing existing content;
- animate transform/opacity instead of geometric properties when appropriate.

Test full lifecycle and interactions; CLS can accumulate after initial load.
