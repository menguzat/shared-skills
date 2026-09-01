# Route and Template Sampling

A website is a population of templates/states, not a homepage.

Create a matrix containing:

- route pattern;
- template family;
- rendering mode;
- high-value conversion?;
- expected traffic;
- media weight;
- JS complexity;
- auth requirement;
- third parties;
- representative URL;
- mobile/desktop test requirement.

Selection priority:

1. one route from every materially distinct template family;
2. high-value conversion pages;
3. known slow routes;
4. worst transfer/JS/media outliers;
5. high-traffic routes;
6. routes affected by shared components being changed.

A systemic fix is not validated until sibling templates are sampled.
