export const isReactSnapPrerender = () =>
  typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

export const prerenderInitial = (initialValue) =>
  isReactSnapPrerender() ? false : initialValue;
