import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero description"
      width={1600}
      height={900}
      sizes="100vw"
      priority
    />
  );
}

// Verify current Next.js semantics/version. Do not mark many images priority.
