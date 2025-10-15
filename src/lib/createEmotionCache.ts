import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

// On the client side, create a meta tag at the top of the <head> and insert the emotion styles before any other style
const createEmotionCache = () => {
  let insertionPoint;

  if (isBrowser) {
    // Find the emotion insertion point
    const emotionInsertionPoint = document.querySelector(
      'meta[name="emotion-insertion-point"]',
    ) as HTMLElement;
    insertionPoint = emotionInsertionPoint ?? undefined;
  }

  return createCache({
    key: 'mui-style',
    insertionPoint,
    // Ensure consistent style insertion order
    prepend: true,
    // Enable speedy mode for better performance on client
    speedy: isBrowser,
  });
};

export default createEmotionCache;