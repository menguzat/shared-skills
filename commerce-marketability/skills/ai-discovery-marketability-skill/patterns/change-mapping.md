# Pattern: Every Change Maps to a Failure Stage

Before editing code/content, write a change record:

```yaml
problem: "Product material is absent from visible page and feed"
pipeline_stage: "qualification"
epistemic_class: "INFERENCE"
verified_fact: "100% linen"
change:
  - "render Material: 100% linen in product specification"
  - "add Product.material JSON-LD"
  - "add feed material field if supported"
validation:
  - "rendered page contains exact verified value"
  - "JSON-LD matches visible content"
  - "feed matches source-of-truth catalog"
experiment_after: "retest natural-material constraint family"
```

Reject changes with no diagnosed problem or validation method.
