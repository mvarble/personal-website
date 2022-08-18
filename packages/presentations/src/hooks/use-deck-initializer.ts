import React from 'react';
import shallow from 'zustand/shallow';

import useDeck from './use-deck';

export default function useDeckInitializer(title: string, slug: string, dateString: string) {
  const [setTitle, setSlug, setDate] = useDeck(
    deck => [deck.setTitle, deck.setSlug, deck.setDate], 
    shallow,
  );
  React.useEffect(() => setTitle(title), [setTitle, title]);
  React.useEffect(() => setSlug(slug), [setSlug, slug]);
  React.useEffect(() => setDate(new Date(dateString)), [setDate, dateString]);
}
