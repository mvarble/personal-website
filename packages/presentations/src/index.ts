import remarkToDeckSchema from './remark-to-deck-schema';
import Deck from './components/deck';
import Fragment from './components/fragment';
import Slide from './components/slide';
import useDeck from './hooks/use-deck';
import {
  Options,
  defaultOptions,
  SlideState,
  DeckMode,
  DeckModeCallback,
  Dimensions,
  DeckState,
} from './types';

export default remarkToDeckSchema;

export {
  Deck,
  Fragment,
  Slide,
  useDeck,
  Options,
  defaultOptions,
  SlideState,
  DeckMode,
  DeckModeCallback,
  Dimensions,
  DeckState,
  remarkToDeckSchema,
};
