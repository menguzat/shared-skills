---
name: iyi-turkce
version: 1.0.0
description: >
  Agentic Turkish writing, copywriting, UX writing, editing, and translation skill.
  Produces contemporary, natural, precise Turkish; detects English-calque interference,
  redundancy, ambiguity, and weak web copy; supports evidence-led bold brand voice
  inspired by LYF.lab without sacrificing correctness or factual discipline.
license: Original skill content. Source references retain their own licenses/copyright.
---

# İyi Türkçe

## Mission

Produce Turkish that sounds as if it was **thought in Turkish**, not translated into Turkish.

Optimize simultaneously for:

1. factual and semantic correctness;
2. natural contemporary Turkish;
3. clarity and economy;
4. correct current spelling and punctuation;
5. audience/task fit;
6. strong information hierarchy for digital reading;
7. deliberate brand voice;
8. creative force where the context permits it.

Do not turn the skill into linguistic policing. Distinguish:

- **HATA** — meaning, grammar, spelling, punctuation, or structure is wrong under the selected authority;
- **RİSK** — understandable, but likely ambiguous, calqued, redundant, or hard to process;
- **TERCİH** — multiple legitimate forms exist; choose deliberately and consistently;
- **YERLEŞMİŞ KULLANIM** — once-disputed form is now conventional in the target domain;
- **MARKA TERCİHİ** — a deliberate voice choice that remains understandable and semantically sound.

The source guide explicitly treats Turkish as changing and context-dependent. Preserve that attitude.

---

# 1. Rule precedence

When rules conflict, use this order:

1. **Truth and intended meaning**
2. **User/project requirements and approved terminology**
3. **Legal, regulatory, safety, contractual, and factual constraints**
4. **Target audience and user task**
5. **Natural Turkish syntax and semantic clarity**
6. **Current TDK spelling and punctuation**
7. **Domain convention / established professional terminology**
8. **Project voice and tone**
9. **Conciseness**
10. **Creativity**

Never sacrifice a higher rule to satisfy a lower one.

Examples:

- Do not replace an established technical term with an obscure Turkish coinage merely to sound "more Turkish".
- Do not preserve an English sentence structure merely because the individual Turkish words are correct.
- Do not make a claim stronger because stronger copy sounds more confident.
- Do not keep a joke in a payment error, safety warning, or destructive-action confirmation if it weakens comprehension.

---

# 2. Source hierarchy

## 2.1 Orthography

For current spelling, capitalization, suffix attachment, abbreviations, and punctuation:

1. project-specific approved style guide, if any;
2. current TDK Yazım Kılavuzu / Güncel Türkçe Sözlük;
3. explicit domain standard where TDK does not cover the term.

Do not treat an older printed source as stronger than a current official spelling reference.

## 2.2 Language diagnosis

Use Necmiye Alpay's *Türkçe Sorunları Kılavuzu* as a **diagnostic framework**, especially for:

- English interference;
- unnecessary pronouns;
- unnecessary `bir`;
- semantic duplication;
- subject–predicate and modifier relationships;
- translation calques;
- ambiguity;
- emphasis and Turkish word order;
- overuse of generic support verbs;
- distinction between "wrong", "awkward", "new", "colloquial", and "established".

Do not reproduce the book. Apply its principles with original examples.

## 2.3 Digital writing

Use current UX/content-design principles for task-first writing, scannability, descriptive headings, short paragraphs, action-oriented labels, content hierarchy, microcopy, error recovery, and mobile constraints.

## 2.4 Brand writing

Use the project's actual brand language as primary evidence.

The bundled **LYF-BOLD** profile is a reusable voice model inspired by LYF.lab's public language: short thesis-first statements, systems thinking, productive contrast, material/process evidence, and restrained confidence.

---

# 3. Operating modes

Choose one primary mode. Combine only when necessary.

| Mode | Purpose | Default output behavior |
|---|---|---|
| `YAZ` | Write new Turkish prose | Natural, contemporary, clear |
| `DÜZENLE` | Rewrite existing Turkish | Preserve meaning; improve Turkish |
| `DENETLE` | Audit without rewriting everything | Findings + prioritized fixes |
| `WEB-COPY` | Website/landing/product copy | Scan-first, conversion-aware |
| `UX` | UI labels, forms, errors, onboarding | Task-first; minimal ambiguity |
| `MARKA` | Brand/campaign copy | Strong voice; evidence-led |
| `LYF-BOLD` | Bold systems/material voice | Thesis + tension + proof |
| `ÇEVİR` | Translate into Turkish | Faithful-natural by default |
| `TRANSCREATE` | Adapt marketing copy into Turkish | Preserve effect, not syntax |
| `TEKNİK` | Technical/product documentation | Neutral, exact, low-flair |
| `SEO-WEB` | Search-aware web prose | Human-first; no keyword distortion |

If the user asks only to "translate", default to `ÇEVİR`, not literal translation.

---

# 4. Required preflight

Before writing or rewriting, identify:

- **destination** — website, UI, article, deck, documentation, social post, product page;
- **audience** — consumer, B2B, expert, general, internal;
- **job of the text** — explain, persuade, orient, sell, reassure, instruct, differentiate;
- **required facts** — prices, performance, certification, origin, lead times;
- **protected terms** — brand, product, technical, legal, scientific names;
- **voice profile** — neutral, digital, LYF-BOLD, other;
- **risk level** — ordinary marketing vs. legal/safety/regulated copy.

If a fact required for a claim is missing, do not invent it. Use a placeholder or ask for the fact if it blocks the task.

Do not ask questions when the task can be completed correctly without them.

---

# 5. Semantic preservation gate

For `DÜZENLE`, `ÇEVİR`, and `TRANSCREATE`, build an internal preservation inventory before changing prose.

Protect names, dates, quantities, units, ranges, negation, comparisons, requirements, recommendations, uncertainty, conditions, exceptions, causal relationships, product claims, technical terms, and literal technical payloads such as URLs, code, commands, identifiers, file paths, or quoted UI labels.

After rewriting, verify every protected item.

A more elegant sentence that changes `might` into `will`, `should` into `must`, or "up to 30%" into "30%" is a failed rewrite.

---

# 6. The core Turkish pass

Run these passes in order.

## Pass 1 — Meaning

Ask:

- What does each sentence actually assert?
- Is the actor clear where it matters?
- Is causality explicit and correct?
- Does any word accidentally modify the wrong phrase?
- Is the referent of every pronoun clear?
- Is any sentence understandable only because the reader can guess from context?

Fix meaning before style.

## Pass 2 — Turkish reconstruction

Check whether the sentence follows Turkish information flow rather than source-language order.

Prefer:

- suffixes over unnecessary pronouns;
- the semantic verb over generic `yapmak`;
- natural Turkish ellipsis where the missing element is recoverable;
- modifiers near what they modify;
- topic → development → predicate flow;
- emphasis through Turkish word order, not imported emphasis patterns.

Do not mechanically force the verb to sentence-final position. Turkish allows marked order for emphasis; choose deliberately.

## Pass 3 — Redundancy

Delete duplicated meaning unless repetition is purposeful rhetoric.

High-value watch patterns include:

- possibility expressed twice;
- cause expressed twice;
- time/duration expressed twice;
- "style/form/method" duplicated inside a word that already contains it;
- pronoun + possessive suffix repeating the same ownership;
- plural information repeated unnecessarily;
- adjective whose meaning is already inherent in the noun;
- generic support verb around a stronger available verb.

Diagnostic examples, not universal regex corrections:

- `bu nedenden dolayı` → often `bu nedenle` or `bundan dolayı`;
- `-bileceği ihtimali` → often `-mesi ihtimali` or `-bileceği`;
- `-bilme becerisi` → often `-ma becerisi`;
- `yaklaşım tarzı` → often `yaklaşım`;
- `zaman süresi` → often `süre`;
- `yol güzergâhı` → often `güzergâh`;
- `beklenmedik sürpriz` → often `sürpriz`.

Context can justify apparent redundancy for irony, rhythm, contrast, or lexicalized usage. Flag; do not auto-delete blindly.

## Pass 4 — Pronouns

Turkish inflection frequently carries person and possession.

Check every `o/ona/onu/onun/onda/ondan/onlar/onların` for necessity.

Delete if suffixes already identify the referent, the pronoun adds no contrast/emphasis, it creates false contrast, or it repeats possession.

Keep if contrast is intentional, referent would otherwise be ambiguous, discourse requires explicit topic reactivation, or rhetoric benefits.

Especially flag pronouns that appear before the noun they represent and force the reader to resolve them later.

## Pass 5 — `bir`

Do not treat English `a/an` as requiring Turkish `bir`.

Ask what `bir` means here:

- exactly one;
- an indefinite instance;
- emphasis;
- approximative/idiomatic function;
- nothing.

If "nothing", remove it.

Do not remove `bir` where number, contrast, idiom, rhythm, or true indefiniteness requires it.

## Pass 6 — Generic verbs and nominalization

Prefer the precise verb.

Weak:
- `kontrol gerçekleştirmek`
- `iyileştirme yapmak`
- `bir değerlendirme yapmak`

Often stronger:
- `kontrol etmek`
- `iyileştirmek`
- `değerlendirmek`

Do not ban noun + verb structures categorically. Some express a distinct process or institutional act.

Watch imported `do` logic: if English repeats an earlier action with `do/did`, Turkish often repeats the actual verb. Do not substitute `yapmak` merely because English does.

## Pass 7 — `olarak`

Flag repeated or unnecessary `olarak`.

Keep when it truly expresses role, classification/status, or a manner relation Turkish needs.

Do not preserve it automatically for English `as`, `-ly`, or analytical constructions.

## Pass 8 — Subject, predicate, and suspended openings

Check:

- subject–predicate number/person consistency;
- every opening phrase eventually connects grammatically to the predicate;
- parenthetical clauses do not leave the sentence skeleton broken;
- coordinated clauses do not silently switch subject or case;
- long sentence openings do not promise a structure that the ending abandons.

If the reader must mentally rebuild the sentence, rewrite it.

## Pass 9 — Voice

Prefer active voice when it reveals responsibility and shortens the sentence.

Use passive voice when actor is unknown/irrelevant, process/result is the topic, domain convention favors it, or naming the actor creates noise.

Do not copy English active/passive preference mechanically.

Avoid double-passive morphology or stacked passive constructions that repeat passivity.

## Pass 10 — Word choice

Prefer the most common precise word the audience understands.

Avoid:
1. unnecessary English because it sounds fashionable;
2. obscure Turkish coinages because they sound ideologically pure.

For foreign/technical terms, choose among:

- established Turkish term;
- established international term;
- Turkish term + English term at first mention;
- English term + Turkish explanation at first mention.

Base the decision on audience comprehension and domain convention.

## Pass 11 — Orthography

Verify uncertain spellings live against current TDK when possible.

Check compounds, capitalization, proper nouns, abbreviations, suffixes, numbers, dates, punctuation, and foreign names.

---

# 7. English-interference pass

When source is English, or Turkish "smells translated", run this pass.

## 7.1 Translate intent, not word sequence

For each sentence identify proposition, function, emphasis, relation to prior sentence, tone, implied subject, and expected reader action. Then rebuild in Turkish.

The source sentence is evidence of meaning, not a syntax template.

## 7.2 Watch literal operator mappings

Do not assume:

- `or` → always `ya da`;
- `do/did` → `yapmak`;
- `a/an` → `bir`;
- possessive pronoun → explicit Turkish pronoun;
- `make sure` → one fixed Turkish phrase;
- `quite` → always `oldukça`;
- `early/late` → always `erken/geç`;
- `for` → always `için`;
- `with` → always `ile`;
- `as` → always `olarak`;
- `of` → always a chained genitive;
- `currently` → always `şu anda` or `halihazırda`.

Translate the relation.

## 7.3 English noun stacks

Break long English noun compounds by meaning. Do not choose a Turkish genitive chain until the semantic relation is clear.

## 7.4 Relative clauses

English post-nominal relative clauses can create overloaded Turkish participial clauses.

If translation becomes hard to parse:

- split the sentence;
- promote important information to a main clause;
- repeat a noun if necessary for clarity;
- avoid long participial stacks merely to stay structurally faithful.

## 7.5 Idioms and metaphor

Translate the intended effect.

Options:

1. natural Turkish idiom;
2. plain semantic equivalent;
3. new metaphor with comparable force in `TRANSCREATE`;
4. omit ornamental metaphor if it contributes no meaning.

---

# 8. Translation modes

## 8.1 `ÇEVİR` — Faithful-natural

Default.

Requirements:

- preserve facts and force;
- preserve intentional ambiguity only if part of the source;
- naturalize syntax;
- adapt punctuation;
- avoid calques;
- retain established terminology;
- do not add marketing claims.

## 8.2 `YAKIN` — Close translation

Use only when user needs source structure visible for legal, linguistic, educational, or comparison reasons.

## 8.3 `TRANSCREATE`

For campaigns, headings, taglines, product marketing.

Preserve strategic proposition, emotional force, contrast, brand personality, and call to action.

May change metaphor, syntax, sentence count, wordplay, rhythm, and explicitness.

Must not change facts, claims, exclusions, price, guarantees, warranty conditions, or regulatory meaning.

---

# 9. Digital writing system

Online text is scanned before it is read.

## 9.1 Information order

Use:

1. what this is / why it matters;
2. proof or useful detail;
3. next action.

Front-load the words that distinguish the section.

Weak heading:
`Daha fazlasını keşfedin`

Better:
`Kenevir lifinin izlenebilirliği`

## 9.2 One block, one job

A page section should usually do one main job: orient, explain, prove, compare, answer, or convert.

## 9.3 Paragraphs

Default web paragraph:
- 1–4 sentences;
- one dominant idea;
- meaningful first sentence;
- no warm-up paragraph before the point.

## 9.4 Headings

Headings should describe content, help scanning out of context, contain differentiating nouns/verbs early, and avoid generic labels when a more informative heading works.

A poetic brand heading is allowed if an adjacent line immediately restores meaning.

## 9.5 Calls to action

A CTA should tell the user what happens next.

Prefer:
- `Koleksiyonu incele`
- `Teklif iste`
- `Numune talep et`
- `Ölçülerini gönder`

Avoid:
- `Tıkla`
- `Buraya tıklayın`
- `Devam` when destination is not obvious;
- clever labels that hide the action.

## 9.6 Links

Link text should make sense without surrounding prose when practical.

Avoid repeated `burada`, `detaylar`, `daha fazla`. Name the destination or task.

## 9.7 Mobile

Shorten in this order:

1. delete redundant context;
2. replace phrase with precise verb;
3. move explanation outside the control;
4. use established abbreviation if truly known;
5. shorten label.

Never delete the action or distinction.

---

# 10. UX writing

UX copy is functional language.

Priority:

1. user knows what happened;
2. user knows what to do;
3. user can predict the consequence;
4. tone matches the situation.

## Buttons

Prefer verbs or verb phrases. Make paired actions explicit:
- `Sil` / `Vazgeç`
- `Taslağı koru` / `Taslağı sil`

Avoid `Evet/Hayır` when the question is complex.

## Errors

An error message should answer, when relevant:
- What failed?
- Why, if known and useful?
- What can the user do?
- Was data preserved?

Do not blame, joke during high-friction failures, or invent a cause.

## Destructive actions

Name the object and consequence.

Weak:
`Emin misiniz?`

Better:
`"Mart raporu" silinsin mi? Bu işlem geri alınamaz.`

## Empty states

State what the space contains, why empty if useful, and next useful action.

## Forms

Labels name the information. Helper text explains format or reason only when needed. Placeholders are examples, not replacements for labels.

---

# 11. Copywriting: persuasion without fog

Build persuasion from specificity, evidence, contrast, consequence, relevance, constraints, and demonstrable difference.

## 11.1 Empty claims

Flag words such as `benzersiz`, `devrim niteliğinde`, `sürdürülebilir`, `çevre dostu`, `premium`, `üstün`, `yenilikçi`, `doğal`, `etik`, `yüksek kaliteli` when they carry the persuasive burden without evidence.

Do not ban them. Require meaning.

Weak:
`Sürdürülebilir, yenilikçi tekstil çözümleri`

Stronger when true:
`Tarladan kumaşa izlenebilir kenevir sistemleri`

## 11.2 Claim–proof pairing

For every strong claim ask:

- What evidence supports this?
- Is it first-party or independent?
- Is the claim broader than evidence?
- Is a qualifier required?
- Can the user verify it?

If proof is absent, soften the claim, make it aspirational, state process rather than outcome, or request evidence.

## 11.3 Features → consequences

Do not add a user consequence unless verified.

## 11.4 Specificity ladder

Prefer, when supported:

generic adjective
→ observable property
→ measured property
→ verified evidence
→ user consequence

Never fabricate later rungs.

---

# 12. LYF-BOLD voice

A bold, creative, systems-oriented profile.

## 12.1 Core qualities

- decisive;
- intelligent;
- material-aware;
- systems-oriented;
- contemporary;
- concise;
- curious without sounding vague;
- ambitious without inflated promises.

## 12.2 Sentence architecture

### Thesis first
`Tekstil kumaşla başlamaz.`

Then explain the system consequence.

### Productive contrast
`Atığı yönetmek başka. Atığı tasarımın dışında bırakmak başka.`

### Reframe
`Tarım tedarik değildir. Malzeme tasarımının ilk aşamasıdır.`

### Material consequence
Use observable questions:
`Lif ne kadar uzun kaldı? Nerede kırıldı? Kumaşın sınırları burada başlar.`

### System boundary
`İzlenebilirlik etikette başlamaz. Tarlada başlar; veri kaybolduğunda biter.`

These are original examples, not required slogans.

## 12.3 Rhythm

Preferred pattern:
- sharp line;
- explanatory line;
- concrete evidence/detail;
- consequence.

Avoid a whole page made of slogan fragments.

## 12.4 Metaphor budget

Default maximum one strong metaphor/reframe per content block. After metaphor, return to concrete meaning.

Do not stack vague eco-poetic metaphors.

## 12.5 What "bold" does not mean

Not louder adjectives, exclamation marks, absolute certainty, attacking competitors, fake rebellion, or vague manifesto prose.

Bold means a clear proposition, a defendable distinction, and evidence after the claim.

## 12.6 Anti-cliché review list

Flag:
- geleceği şekillendiriyoruz;
- geleceğe dokunuyoruz;
- doğadan ilham alıyoruz;
- sürdürülebilir bir gelecek;
- fark yaratıyoruz;
- tutkuyla üretiyoruz;
- yeniliğin öncüsü;
- sınırları zorluyoruz;
- doğayla uyum içinde;
- kaliteyle buluşuyor;
- eşsiz deneyim;
- yolculuğumuz;
- hikâyemiz (when empty corporate framing).

Allow only if surrounding copy gives specific meaning.

---

# 13. Tone map

| Situation | Tone |
|---|---|
| Brand manifesto | bold, spare, conceptual |
| Product specification | exact, concrete |
| Product benefit | specific, confident |
| Technical report | neutral, cautious |
| Error | calm, useful |
| Warning | direct, uncreative |
| Checkout | reassuring, explicit |
| B2B proposal | competent, concise |
| Social post | sharper, more rhythmic |
| Research uncertainty | precise, qualified |
| Sustainability claim | evidence-first |
| UI navigation | nearly invisible |

Do not carry manifesto voice into password errors.

---

# 14. `sen`, `siz`, and pronoun-light Turkish

Select once per product/brand context.

Use `siz` for formal B2B, higher-risk transactions, broad unknown audiences, or established respectful brand voice.

Use `sen` when the brand deliberately uses close conversational address and surrounding touchpoints are consistent.

Use pronoun-light Turkish when direct imperative is natural and shorter.

Do not switch between `sen` and `siz` casually.

---

# 15. Headline and title system

For contemporary web headings, default project recommendation is **sentence case** unless house style says otherwise. This is a digital style preference, not a universal orthographic claim.

A strong heading should do at least two:

- tell what section is about;
- make a specific proposition;
- create useful tension;
- include a differentiating term;
- remain understandable in an outline.

Headline patterns are prompts, not formulas:

- `X, Y değildir.`
- `X, Y'den önce başlar.`
- `X'i değil, Y'yi tasarlıyoruz.`
- `Sorun X değil. Y.`
- `X ne kadar ...?`

Avoid repeating one pattern across an entire site.

---

# 16. Search-aware Turkish

SEO must not deform Turkish.

- write the user's actual question/topic in natural Turkish;
- include synonyms only when they aid comprehension;
- let Turkish inflection work normally;
- do not force exact-match noun phrases into every heading;
- keep title, H1, intro, and headings semantically aligned;
- answer high-intent questions directly before expanding.

Human readability outranks keyword density.

---

# 17. Review modes

## `DENETLE`

Return:

1. summary;
2. critical meaning/grammar issues;
3. calques;
4. redundancy;
5. word-choice/terminology issues;
6. web/UX issues if relevant;
7. voice issues;
8. prioritized changes;
9. optional revised sample.

Severity:

- **K0 — ANLAM/FİİLİ HATA**
- **K1 — YÜKSEK**
- **K2 — ORTA**
- **K3 — DÜŞÜK**
- **T — TERCİH**

For each finding:

`location → original → issue → proposed form → rationale → confidence`

Collapse repeated symptoms into a systemic finding when useful.

## `DÜZENLE`

Perform a full rewrite preserving facts, meaningful structure, intentional voice, terms, and claims.

Return clean copy by default. Give notes only when requested or when interpretation changed.

---

# 18. Editing order: smallest change first

Try:

1. delete redundant word;
2. replace vague phrase with precise word;
3. move modifier;
4. restore omitted semantic element;
5. change conjunction/case suffix;
6. split sentence;
7. rebuild sentence;
8. rebuild paragraph.

Do not rewrite a whole paragraph to solve a local issue unless its structure is broken.

---

# 19. Read-aloud and rhythm pass

Check:

- repeated suffix chains;
- repeated `-dır/-dir`;
- repeated `olarak`;
- same sentence length many times;
- awkward sound collisions;
- overloaded participles;
- accidental rhyme;
- monotonous slogan fragments.

Marketing copy may vary short → medium → short/medium.
Technical copy prioritizes clarity.

---

# 20. What not to do

Never:

- translate word by word by default;
- "purify" technical language at the cost of understanding;
- invent Turkish equivalents as facts;
- strengthen unsupported claims;
- use `bir`, pronouns, or `olarak` just because English source does;
- replace every passive sentence with active;
- use a slogan where a UI label is needed;
- make every sentence punchy;
- fill every page with rhetorical questions;
- remove ambiguity that is legally/strategically intentional without flagging it;
- correct quotations silently;
- normalize historical/literary text unless asked;
- treat a linter match as proof of error;
- present every source-book preference as universal consensus;
- use TDK as an excuse to ignore established domain terminology;
- preserve an English pun through incomprehensible Turkish.

---

# 21. Deterministic final checklist

## Meaning
- [ ] Facts preserved.
- [ ] Negation, conditions, modality, quantities preserved.
- [ ] Actors/referents clear.
- [ ] No accidental causal claim.

## Turkish
- [ ] Sentence sounds composed in Turkish.
- [ ] Unnecessary pronouns checked.
- [ ] `bir` checked.
- [ ] `olarak` checked.
- [ ] generic `yapmak` checked.
- [ ] semantic duplication checked.
- [ ] subject–predicate skeleton intact.
- [ ] modifiers attach correctly.

## Vocabulary
- [ ] Common precise words preferred.
- [ ] Foreign terminology intentional.
- [ ] Domain terms consistent.
- [ ] No invented equivalent presented as standard.

## Orthography
- [ ] Uncertain forms verified.
- [ ] Punctuation checked.
- [ ] Names, abbreviations, numbers, suffixes checked.

## Digital
- [ ] Main point appears early.
- [ ] Headings scan well.
- [ ] Paragraphs purposeful.
- [ ] CTAs name action.
- [ ] Mobile labels understandable.

## Copy
- [ ] Strong claims have evidence/qualification.
- [ ] Generic adjectives do not carry argument.
- [ ] One section has one primary job.
- [ ] Creativity does not hide meaning.

## Brand
- [ ] Voice matches context.
- [ ] Boldness comes from proposition, not hype.
- [ ] Metaphor count controlled.
- [ ] Tone fits user state.

## Translation
- [ ] Source syntax did not leak unnecessarily.
- [ ] Idioms translated by function.
- [ ] English operator mappings challenged.
- [ ] Final text stands alone in Turkish.

---

# 22. Loading map

- Core language problems → `references/turkce-sorunlari-synthesis.md`
- English interference → `references/english-interference.md`
- Translation → `references/translation-naturalization.md`
- Web copy → `references/digital-copy.md`
- UX/microcopy → `references/ux-writing.md`
- LYF voice → `references/lyf-bold-voice.md`
- Claims → `references/evidence-led-copy.md`
- Orthography → `references/orthography-source-policy.md`
- Terminology → `references/terminology.md`
- Rhythm → `references/rhythm-and-emphasis.md`
- Audit → `modes/denetle.md`
- Translation → `modes/cevir.md`
- Web copy → `modes/web-copy.md`
- LYF-BOLD → `modes/lyf-bold.md`
- Decision trees → `decision-trees/`
- Templates → `templates/`
- Examples → `examples/`
- Evals → `evals/`
- Candidate linter → `scripts/iyi_turkce_lint.py`

---

# 23. Evidence discipline

When a language rule is contested or usage-dependent:

- do not say `yanlış` when `tercih`, `eskimiş`, `yerleşmekte`, or `bağlama bağlı` is more accurate;
- identify the authority used;
- distinguish orthographic rules from stylistic recommendations;
- distinguish source-book diagnosis from current official spelling;
- check current sources for high-stakes or disputed forms.

The goal is not correctness theatre.

The goal is Turkish that is **clear, alive, precise, natural, memorable when necessary, and invisible when it should be.**
