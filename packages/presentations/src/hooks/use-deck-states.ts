import React from 'react';

import useDeck from './use-deck';

export default function useDeckStates(
  ref: React.RefObject<HTMLElement>,
  fragmentsBySlide: number[]
) {
  // step 0: interface with the deck state
  const initializeStates = useDeck(deck => deck.initializeStates);

  // step 1: populate these objects on changes
  React.useEffect(() => {
    if (!ref.current) return;
    initializeStates(ref.current, fragmentsBySlide);
  }, [ref.current, fragmentsBySlide, initializeStates]);
}
