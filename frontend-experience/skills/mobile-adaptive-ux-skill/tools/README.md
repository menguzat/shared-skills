# Tools

## mobile-ux-static-audit.mjs

Usage:

```bash
node tools/mobile-ux-static-audit.mjs /path/to/project
```

The script scans source files for review candidates including:
- zoom restriction
- legacy `100vh`
- large fixed widths
- overflow masking
- `touch-action:none`
- mouse-hover handlers
- JavaScript width branching
- fixed bottom UI needing safe-area review

It is intentionally warning-based. A regex match is not proof of a defect.

Exit codes:
- `0` - no critical match
- `2` - at least one critical match
