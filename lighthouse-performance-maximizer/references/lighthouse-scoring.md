# Lighthouse Performance Scoring

**Evidence: OFFICIAL**

Lighthouse converts metric observations to 0–100 metric scores using scoring distributions, then combines those into the Performance score with weights. The current Chrome documentation lists the Lighthouse 10 weights:

- FCP 10%
- Speed Index 10%
- LCP 25%
- TBT 30%
- CLS 25%

Do not assume these weights are permanent. Persist `lighthouseVersion` from every LHR and inspect the current report/tool when score sensitivity matters.

Important operational consequences:

- a failing diagnostic with no material effect on score metrics may be lower priority;
- improving a high-weight metric can outperform clearing many low-impact diagnostics;
- score response is nonlinear;
- the effort needed to go from 99→100 can be comparable to a much larger improvement at lower scores;
- mobile and desktop have different scoring behavior;
- one score is not a reliable performance characterization because environmental variability changes measurements.

Use the score to prioritize, but diagnose with metric traces and subparts.
