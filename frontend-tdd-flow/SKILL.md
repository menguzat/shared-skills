---
name: frontend-tdd-flow
description: End-to-end test-driven development workflow for web frontends. Enforces creating specs, drafting Playwright user story, SEO/GEO, and layout tests first, isolating dev servers, and fixing code until 100% green compliance. Use whenever designing, building, or testing web frontends.
---

# Frontend TDD & Automated Compliance Skill

This skill provides the comprehensive workflow for executing Test-Driven Development (TDD) and Automated End-to-End Compliance Testing on frontend applications.

## Key Phases

### Phase 1: Requirement Specification & Test Drafting
1. Document user stories, SEO/GEO requirements, and layout bounds in the track specification.
2. Draft test files under `tests/` before updating frontend application code:
   - **Suite A**: Browsing & Discovery
   - **Suite B**: Product Detail Page (PDP)
   - **Suite C**: Cart Operations & Upsells
   - **Suite D & E**: Localization & Checkout Flow
   - **Suite F**: SEO & GEO Compliance (Meta, OG, Dynamic Head updates)
   - **Suite G**: Layout & Visual Element Compliance (Heights, touch targets, viewports)

### Phase 2: Test Server & API Mocking Configuration
1. Configure `playwright.config.ts` with a dedicated port (e.g. `5179`) and `reuseExistingServer: false` to avoid port collisions with background servers.
2. Set up deterministic API route interception using `page.route()` in test setup for all backend endpoints (`/dpp-api/*`, `/dpp-api/commerce/*`, `/dpp-api/lens-flip/*`).

### Phase 3: Code Implementation & Iterative Verification
1. Run Playwright tests (`npx playwright test`).
2. Identify failing assertions (red state).
3. Modify application components to satisfy requirements (green state).
4. Ensure dynamic head modifications (OpenGraph tags, `html lang`) use safe DOM attribute search functions to avoid CSS selector colon syntax errors.

### Phase 4: Full Suite Execution & Conductor Tracking
1. Run full test suite to guarantee 100% pass rate.
2. Update Conductor track documentation and complete track tasks.
