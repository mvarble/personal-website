import React from 'react';
import shallow from 'zustand/shallow';

import useDeck from './use-deck';
import { DeckMode } from '../types';

interface ResizeStyle {
  width: string;
  height: string;
  transform: string;
  transformOrigin: string;
}

export default function useResize(
  width: number,
  height: number,
  viewWidth: number, 
  viewHeight: number,
  mode?: DeckMode,
): ResizeStyle {
  // get the dimensions from the deck
  const [dimensions, setDimensions] = useDeck(
    deck => [deck.dimensions, deck.setDimensions], 
    shallow,
  );

  // ensure dimension state is calibrated
  React.useEffect(() => {
    if (typeof dimensions === 'undefined') {
      // set dimensions to props if undefined
      setDimensions({ width: viewWidth, height: viewHeight });
    }
  }, [dimensions, viewWidth, viewHeight]);

  // create the css style for the resize
  return React.useMemo(() => {
    const deckWidth = (dimensions && dimensions.width) || viewWidth;
    const deckHeight = (dimensions && dimensions.height) || viewHeight;
    const scale = Math.min(width / deckWidth, height / deckHeight);
    const x = (width - deckWidth * scale) / 2;
    const y = (height - deckHeight * scale) / 2;
    const printMode = mode === DeckMode.Print;
    const modeScale = printMode ? 0.66 : 1
    const modeShiftX = deckWidth * scale * (1-modeScale) / 2;
    const modeShiftY = printMode ? -y : 0;
    return {
      width: `${deckWidth}px`,
      height: `${deckHeight}px`,
      transform: `translate(${x + modeShiftX}px, ${y + modeShiftY}px) scale(${scale * modeScale})`,
      transformOrigin: '0 0',
    }
  }, [dimensions, width, height, viewWidth, viewHeight, mode]);
}
