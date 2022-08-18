import React from 'react';
import shallow from 'zustand/shallow';

import useDeck from './use-deck';
import { isNonnegativeInteger } from '../utils';
import { DeckMode, SlideState } from '../types';

export default function useLocation(hash: string) {
  // step 0: interface with deck state
  const [
    mode, 
    slideState, 
    setMode, 
    setSlideState, 
  ] = useDeck(
    deck => [
      deck.mode, 
      deck.slideState, 
      deck.setMode, 
      deck.setSlideState, 
    ], 
    shallow,
  );

  // step 1: calibrate deck state to location
  React.useEffect(() => {
    // `mode` and `slideState` depend on `hash`
    if (typeof mode === 'undefined' || typeof slideState === 'undefined') {
      let newMode: DeckMode | undefined;
      let newSlideState: SlideState | undefined;
      if (hash === '#/print') {
        // print mode
        newMode = DeckMode.Print;
        newSlideState = { indexh: 0, indexf: -1 };
      } else if (hash.match(/^#\/[0-9]+\/-?[0-9]+$/)) {
        const [indexh, indexf] = hash.slice(2).split('/').map(Number);
        if (isNonnegativeInteger(indexh) && isNonnegativeInteger(indexf + 1)) {
          newMode = DeckMode.Present;
          newSlideState = { indexh, indexf };
        }
      }
      if (typeof newMode === 'undefined' || typeof newSlideState === 'undefined') {
        newMode = DeckMode.Present;
        newSlideState = { indexh: 0, indexf: -1 };
      }
      setMode(newMode);
      setSlideState(newSlideState);
    }
  }, [hash, mode, slideState, setMode, setSlideState]);
}
