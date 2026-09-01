# Pre-Deploy Checklist

## Truth
- [ ] No fabricated claims, ratings, experts, certifications, reviews, prices, inventory, or locations.
- [ ] All volatile facts have a source of truth.

## Search
- [ ] Production robots rules intentional.
- [ ] No accidental staging `noindex` copied to production.
- [ ] Canonicals use production URLs.
- [ ] Sitemap uses production canonical URLs.
- [ ] Redirects and 404 behavior tested.

## Entity/data
- [ ] Organization/product names consistent.
- [ ] JSON-LD valid JSON.
- [ ] Structured values match visible page.
- [ ] Product variant relationships are correct.
- [ ] Feed/page price and availability match.

## Experience
- [ ] Main content works with JS failure where architecture permits or is server-rendered appropriately.
- [ ] Semantic links/buttons/forms.
- [ ] Mobile usability checked.
- [ ] Performance regression checked.

## Measurement
- [ ] Baseline captured.
- [ ] Analytics/referral tagging preserved.
- [ ] Experiment prompts/versioned manifest preserved if lab is in use.
