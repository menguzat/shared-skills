# Package index

**Skill:** `iyi-turkce`  
**Version:** 1.0.0

## Structure

### Root

- `CHANGELOG.md`
- `NOTICE.md`
- `README.md`
- `SKILL.md`

### references

- `references/book-rule-map.md`
- `references/brand-voice-controls.md`
- `references/copywriting-system.md`
- `references/digital-copy.md`
- `references/english-interference.md`
- `references/evidence-led-copy.md`
- `references/localization-ui.md`
- `references/lyf-bold-voice.md`
- `references/online-research-synthesis.md`
- `references/orthography-source-policy.md`
- `references/punctuation-and-numbers.md`
- `references/rhythm-and-emphasis.md`
- `references/sentence-structure.md`
- `references/source-registry.md`
- `references/terminology.md`
- `references/translation-naturalization.md`
- `references/turkce-sorunlari-synthesis.md`
- `references/ux-writing.md`

### modes

- `modes/author.md`
- `modes/brand.md`
- `modes/cevir.md`
- `modes/denetle.md`
- `modes/lyf-bold.md`
- `modes/rewrite.md`
- `modes/seo-web.md`
- `modes/technical.md`
- `modes/transcreate.md`
- `modes/ux.md`
- `modes/web-copy.md`

### decision-trees

- `decision-trees/bir.md`
- `decision-trees/claim-strength.md`
- `decision-trees/creative-vs-clear.md`
- `decision-trees/cta.md`
- `decision-trees/foreign-term.md`
- `decision-trees/is-this-error.md`
- `decision-trees/olarak.md`
- `decision-trees/pronoun.md`
- `decision-trees/sen-siz.md`
- `decision-trees/translation-choice.md`

### templates

- `templates/content-matrix.csv`
- `templates/copy-brief.md`
- `templates/page-copy-map.md`
- `templates/style-audit-report.md`
- `templates/terminology-ledger.csv`
- `templates/translation-brief.md`
- `templates/translation-qa.md`
- `templates/voice-matrix.md`

### examples

- `examples/audit-example.md`
- `examples/lyf-bold-examples.md`
- `examples/translation-before-after.md`
- `examples/ux-microcopy.md`
- `examples/web-before-after.md`

### data

- `data/brand-cliche-watchlist.txt`
- `data/calque-watchlist.csv`
- `data/semantic-operators.txt`

### scripts

- `scripts/__pycache__/iyi_turkce_lint.cpython-313.pyc`
- `scripts/iyi_turkce_lint.py`

### evals

- `evals/case-01-pronoun-redundancy.md`
- `evals/case-02-translation-do.md`
- `evals/case-03-uncertainty.md`
- `evals/case-04-web-hero.md`
- `evals/case-05-ux-error.md`
- `evals/case-06-foreign-term.md`
- `evals/case-07-overcompression.md`
- `evals/case-08-lyf-bold.md`
- `evals/case-09-bir.md`
- `evals/case-10-audit.md`
- `evals/rubric.md`

### tests

- `tests/README.md`
- `tests/lint-smoke.txt`

## Design summary

- Current orthography is resolved against live TDK when uncertain.
- The supplied book is used as a diagnostic reasoning source, not redistributed.
- Translation defaults to faithful-natural Turkish, not literal syntax transfer.
- Digital copy is scan-first and task-first.
- `LYF-BOLD` is a controlled brand-voice profile: thesis, contrast, proof, limits.
- Strong claims require evidence or qualification.
- Linter results are candidates, never automatic corrections.
