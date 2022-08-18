import React from 'react';

import useDeck from '../hooks/use-deck';
import { isNonnegativeInteger } from '../utils';

const DISPLAY_DISTANCE = 2;

interface SlideProps {
  index: number | string;
}

export default function Slide({ children, index }: React.PropsWithChildren<SlideProps>) {
  // parse the slide index
  const slideIndex = parseNumber(index);

  // create a reference to the dom element
  const ref = React.useRef(null);

  // interface with the deck to get the slide state
  const slideState = useDeck(deck => deck.slideState);

  let visibilityClass: string;
  if (slideState) {
    const { indexh: viewIndex } = slideState;
    if (slideIndex < viewIndex - DISPLAY_DISTANCE) {
      visibilityClass = 'past hidden';
    } else if (slideIndex < viewIndex) {
      visibilityClass = 'past';
    } else if (slideIndex === viewIndex) {
      visibilityClass = 'present';
    } else if (slideIndex <= viewIndex + DISPLAY_DISTANCE) {
      visibilityClass = 'future';
    } else {
      visibilityClass = 'future hidden';
    }
  } else {
    visibilityClass = 'hidden'
  }

  return (
    <section 
      className={ `slide ${visibilityClass}` }
      ref={ ref }>
      { children }
    </section>
  );
}

function parseNumber(input: number | string) {
  const out = Number(input);
  if (!isNonnegativeInteger(out)) {
    throw new Error('Slide: index cannot be parsed to nonnegative integer!');
  }
  return out;
}
