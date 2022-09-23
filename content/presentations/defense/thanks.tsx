import React from 'react';
import * as d3 from 'd3';

import { useDeck } from '@presentations';

export default function Thanks() {
  const [indexState, setIndexState] = React.useState(0);
  const slideState = useDeck(deck => deck.slideState);
  React.useEffect(() => {
    if (!slideState || slideState.indexh < 37) {
      setIndexState(0);
      return;
    }
    let interval;
    setTimeout(() => {
      interval = setInterval(() => setIndexState(s => s + 0.01), 10);
    }, 1000);
    return () => {
      setIndexState(0);
      clearInterval(interval);
    };
  }, [slideState]);

  const colorIndex = 0.5 + 0.5 * Math.cos(Math.PI * indexState);
  const color = d3.interpolatePuOr(colorIndex);
  const opacity = 0.5 - 0.5 * Math.cos(3 * indexState);
  return (
    <div className="h-full flex justify-center flex-col text-center"
      style={{ backgroundColor: `${color.slice(0,-1)},${opacity})` }}
    >
      thank you.
    </div>
  );
}
