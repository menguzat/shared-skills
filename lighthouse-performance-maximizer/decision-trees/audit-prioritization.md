# Audit Prioritization Decision Tree

Use after root-cause findings have been established.

```text
Finding
  |
  +-- Is it causally connected to a material metric/CWV loss?
  |      |
  |      +-- NO --> DO-NOT-BOTHER / DEFER unless strategically important
  |      |
  |      +-- YES
  |
  +-- Impact >= 4?
         |
         +-- YES
         |    |
         |    +-- Effort <= 2, confidence >= 4,
         |    |   reproducibility >= 4, risk <= 2?
         |    |       |
         |    |       +-- YES --> P0 QUICK WIN
         |    |       +-- NO
         |    |
         |    +-- Effort <= 3, confidence >= 3, risk <= 3?
         |    |       |
         |    |       +-- YES --> P1 HIGH VALUE
         |    |       +-- NO --> P2 STRUCTURAL
         |    |
         |
         +-- NO
              |
              +-- Impact == 3 AND effort <= 2 AND confidence >= 3?
              |       |
              |       +-- YES --> P3 OPPORTUNISTIC
              |       +-- NO --> P4 LOW PRIORITY
```

Within the bucket, rank by:

`(impact × reach × business importance × confidence × reproducibility) / (effort × regression risk)`

Tie-break by lower effort, higher impact, higher confidence, higher reach, lower risk.

## Why this is not a Lighthouse-savings sorter

Lighthouse's estimated byte/ms savings can help establish evidence, but do not automatically represent total score impact, route reach, business importance, implementation complexity, or regression risk. The ranking therefore combines causal measurement with engineering cost and scope.
