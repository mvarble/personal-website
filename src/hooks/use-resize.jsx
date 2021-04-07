import React from 'react';

export default function useResize(min=0, max=Infinity) {
  // create a ref to measure the size of the window
  const ref = React.useRef()

  // create a state for the dimensions
  const [width, setWidth] = React.useState(0);

  // create a callback for resizes
  const resize = React.useCallback(
    width => setWidth(Math.max(min, Math.min(width, max))),
    [setWidth]
  );

  // effect: initialize width
  React.useEffect(() => {
    if (width !== 0) return;
    resize(ref.current.parentElement.offsetWidth);
  }, [width, resize, ref]);

  // effect: change dimensions on parent resizes
  React.useEffect(() => {
    const observer = new ResizeObserver(entries => entries.forEach(entry => {
      resize(entry.contentRect.width);
    }));
    observer.observe(ref.current.parentElement);
    return () => observer.disconnect();
  }, [resize, ref]);

  // return the ref
  return ref;
}
