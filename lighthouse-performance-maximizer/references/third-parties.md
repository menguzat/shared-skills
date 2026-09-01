# Third-Party Performance

Classify every third party by product necessity and earliest required moment.

| Class | Examples | Typical strategy |
|---|---|---|
| Critical | payment/auth required immediately | minimize and load deliberately |
| Interaction-needed | map/editor/chat after intent | lazy on interaction/near viewport |
| Consent-dependent | analytics/marketing | after valid consent and policy trigger |
| Decorative/optional | social embeds/badges | facade, lazy, remove if low value |

Measure:

- transferred bytes;
- CPU/long tasks;
- request chains;
- impact on LCP/TBT/CLS;
- variance from network/ad auctions;
- business/legal consequences of delay/removal.

A retained third party can be an accepted residual constraint. Document it rather than spoofing audits.
