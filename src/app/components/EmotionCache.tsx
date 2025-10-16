'use client';

import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Create cache outside component to ensure consistency between server and client
let cache: ReturnType<typeof createCache>;

const createEmotionCache = () => {
  return createCache({
    key: 'mui',
    // Ensure styles are inserted in the correct order
    prepend: true,
  });
};

export default function EmotionCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize cache only once to prevent hydration mismatches
  if (!cache) {
    cache = createEmotionCache();
  }

  const [cacheState] = useState(() => cache);

  return <CacheProvider value={cacheState}>{children}</CacheProvider>;
}