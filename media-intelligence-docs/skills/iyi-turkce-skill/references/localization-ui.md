# Turkish localization for interfaces

## Translate component function

A button label is not a sentence fragment to translate in isolation.

Know:
- current state;
- target state;
- object;
- consequence.

`Continue` may become:
- `Devam`;
- `Ödemeye geç`;
- `Kurulumu tamamla`;
- `Sonraki adım`;
depending on function.

## Space

Turkish can expand because of suffixes and longer lexical forms.

Do not solve truncation by:
- deleting object distinction;
- cryptic abbreviation;
- English leakage.

Try:
- shorter Turkish verb;
- move supporting text outside control;
- icon + accessible label only where convention supports it.

## UI strings as product API

Treat stable UI terminology like an API:
- consistent;
- documented;
- tested;
- coordinated with QA.

Do not change a UI term merely for stylistic variety.

## Error recovery

Translate system meaning, not original emotional tone.

English "Oops!" does not require a Turkish interjection.
Use one only if brand voice and situation make it useful.

## Variables

Preserve placeholders:
`{name}`, `%s`, `{{count}}`, ICU syntax, HTML, Markdown.

Do not alter placeholder order without understanding localization system.
