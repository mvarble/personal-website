import { useSwipeable } from 'react-swipeable'
import shallow from 'zustand/shallow';

import useDeck from './use-deck';

export default function useSwipe() {
  // get callbacks provided by the deck
  const [previous, next] = useDeck(s => [s.previous, s.next], shallow);

  // precompose our store callbacks into event callbacks
  const props = useSwipeable({ onSwipedLeft: next, onSwipedRight: previous });

  // return the event callbacks
  return props;
}
