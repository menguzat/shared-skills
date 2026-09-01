export function loadOptionalWidget() {
  if (document.querySelector('script[data-optional-widget]')) return;
  const script = document.createElement('script');
  script.src = 'https://example.invalid/widget.js';
  script.async = true;
  script.dataset.optionalWidget = 'true';
  document.head.appendChild(script);
}

// Prefer a real product trigger: user opens chat, map enters viewport, consent is
// granted, etc. Do not delay required payment/auth functionality blindly.
