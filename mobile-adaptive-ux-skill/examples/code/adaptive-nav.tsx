import React from 'react';

type Destination = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const destinations: Destination[] = [
  { href: '/home', label: 'Home', icon: <span aria-hidden>⌂</span> },
  { href: '/search', label: 'Search', icon: <span aria-hidden>⌕</span> },
  { href: '/activity', label: 'Activity', icon: <span aria-hidden>◷</span> },
  { href: '/account', label: 'Account', icon: <span aria-hidden>○</span> },
];

/**
 * Same navigation semantics, different compact/large presentations.
 * Presentation switching can be CSS-driven so the destination model remains shared.
 */
export function AdaptiveNavigation() {
  return (
    <>
      <nav className="mobile-primary-nav" aria-label="Primary">
        <ul>
          {destinations.map((item) => (
            <li key={item.href}>
              <a href={item.href}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="desktop-nav" aria-label="Primary">
        <ul>
          {destinations.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
