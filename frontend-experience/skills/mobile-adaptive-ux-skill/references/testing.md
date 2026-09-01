# Testing Reference

## Automation layers

### Source/static review
Use the bundled static audit to find suspicious implementation patterns. It cannot validate actual UX.

### Browser automation
Playwright supports mobile device emulation including viewport, touch, and user agent settings.

Useful tests:
- page-level overflow
- navigation visibility and labels
- Back behavior
- route state preservation
- overlay dismissal
- form progression
- screenshots at compact widths

Source:
- https://playwright.dev/docs/emulation

### Lighthouse
Use for automated performance/accessibility diagnostics. Treat the score as diagnostic evidence rather than a complete usability verdict.

Source:
- https://developer.chrome.com/docs/lighthouse/overview

### Manual / real-device validation
When possible, verify at least one iOS Safari and one Android Chromium environment because emulation does not reproduce every browser UI, keyboard, touch, scrolling, and safe-area behavior.

## Compact viewport matrix

Required baseline:
- 320x~700
- 360x~780
- 390x~844
- 430x~932

These are not device targets. They are pressure tests.

Also test:
- medium width around tablet territory
- landscape small viewport
- long translated labels if localization exists
- larger default/text sizing

## State matrix

Every interactive route should consider:
- initial
- loading
- empty
- error
- dense/maximum realistic data
- authenticated/unauthenticated if relevant
- permission denied if relevant

## Screenshot diff caution

Pixel screenshots are useful for regression but cannot prove navigation clarity, Back correctness, focus semantics, or task efficiency. Pair them with journey assertions.
