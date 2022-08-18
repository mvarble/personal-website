import React from 'react';
import useMeasure from 'react-use-measure';

import { DeckMode } from '../types';
import useDeck from '../hooks/use-deck';
import useDeckInitializer from '../hooks/use-deck-initializer';
import useDeckStates from '../hooks/use-deck-states';
import useLocation from '../hooks/use-location';
import useKeyboard from '../hooks/use-keyboard';
import useSwipe from '../hooks/use-swipe';
import useResize from '../hooks/use-resize';

interface DeckProps {
  location: {
    hash: string;
  };
  data: {
    presentation: {
      title: string;
      slug: string;
      date: string;
      width: number;
      height: number;
      fragmentsBySlide: number[];
    }
  };
}

export default function Deck(props: React.PropsWithChildren<DeckProps>) {
  // step 0: parse the props
  const { children, location, data } = props;
  const { hash } = location;
  const { title, slug, date, width, height, fragmentsBySlide } = data.presentation;

  // step 1: initialize deck frontmatter
  useDeckInitializer(title, slug, date);

  // step 2: create a ref which is to be used for slide state calculations
  const ref = React.useRef<HTMLElement>(null);

  // step 3: ensure deck is aware of all of its states
  useDeckStates(ref, fragmentsBySlide);

  // step 4: ensure location is always calibrated with deck state
  useLocation(hash);

  // step 5: interface keyboard and swipe events with deck
  useKeyboard();
  const swipeHandlers = useSwipe();
  const refPassthrough = (element: HTMLElement | null) => {
    swipeHandlers.ref(element);
    // @ts-ignore
    ref.current = element;
  }

  // step 6 render depending on mode
  const mode = useDeck(deck => deck.mode);

  // step 7: interface window events with deck
  const [containerRef, rect] = useMeasure();
  const resizeStyle = useResize(rect.width, rect.height, width, height, mode);

  // render the deck
  return (
    <div 
      ref={ containerRef } 
      className={ "deck-container" + (mode === DeckMode.Print ? ' print' : '')}>
      <div 
        { ...swipeHandlers } 
        style={ resizeStyle }
        className="deck"
        ref={ refPassthrough }>
        { children }
      </div>
    </div>
  );
}

