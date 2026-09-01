# Audit example

Input:
`Şirketimiz olarak, müşterilerimizin ihtiyaçlarına yönelik olarak geliştirebileceğimiz olası çözümlerin değerlendirilebilmesi ihtimali üzerinde çalışmalar yapıyoruz.`

## Diagnosis

**K1 — sentence overloaded and semantically duplicated**

Patterns:
- `Şirketimiz olarak` unnecessary unless contrast exists;
- `yönelik olarak` can be simplified;
- `geliştirebileceğimiz olası` duplicates possibility;
- `değerlendirilebilmesi ihtimali` duplicates possibility again;
- `çalışmalar yapıyoruz` hides the semantic verb.

Possible rewrite:
`Müşteri ihtiyaçlarına uygun çözümleri değerlendiriyor ve geliştiriyoruz.`

But only use this rewrite if the original truly means both evaluation and development are already happening. If it only describes a future possibility, preserve that uncertainty.
