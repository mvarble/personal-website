import React from 'react';
import shallow from 'zustand/shallow';

import useDeck from './use-deck';
import { DeckMode } from '../types';

const PREVIOUS_KEYS = ['ArrowLeft', 'h', 'k'];
const NEXT_KEYS = ['ArrowRight', 'l', 'j'];
const PRINT_KEYS = ['p'];
const INPUTS = ['input', 'select', 'textarea', 'a', 'button'];

/**
 * This React hook binds the provided callbacks to specific keyboard events
 */
export default function useKeyboard(): void {
  // create the relevant deck callbacks
  const [previous, next, setMode] = useDeck(
    state => [state.previous, state.next, state.setMode], 
    shallow,
  );
  const togglePrint = React.useCallback(
    () => setMode(mode => mode === DeckMode.Print ? DeckMode.Present : DeckMode.Print),
    [],
  );

  // bind listeners to keyboard events
  React.useEffect(() => {
    // our keydown listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // return if we are holding META+..., CTRL+..., or SHIFT+...
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      // ignore when elements are focused
      if (document.activeElement !== null) {
        const el = document.activeElement.tagName.toLowerCase();
        if (INPUTS.includes(el)) return;
      }

      // map keys to effects
      if (PREVIOUS_KEYS.includes(e.key)) previous();
      if (NEXT_KEYS.includes(e.key)) next();
      if (PRINT_KEYS.includes(e.key)) togglePrint();
    };

    // add to event listeners
    window.addEventListener('keydown', handleKeyDown);

    // remove callback
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    };
  }, [previous, next, togglePrint]);
}
