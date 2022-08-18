import React from 'react';
import { Theme, getTheme, updateClass } from '../utils/themes';
import { useSetTheme } from '../hooks/use-theme';

const INPUTS = ['input', 'select', 'textarea', 'a', 'button'];

const THEME_TOGGLE = '`';

export default function useKeyboardShortcuts() {
  const setTheme = useSetTheme();
  React.useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      // return if we are holding META+..., CTRL+..., or SHIFT+...
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      // ignore when elements are focused
      if (document.activeElement !== null) {
        const el = document.activeElement.tagName.toLowerCase();
        if (INPUTS.includes(el)) return;
      }

      /**
       * map keys to respective effects
       */

      // theme toggling
      if (e.key === THEME_TOGGLE) {
        if (getTheme() === Theme.Dark) {
          setTheme(Theme.Light);
        } else {
          setTheme(Theme.Dark);
        }
        updateClass();
      }
    }

    /**
     * bind a callback to the keydown events
     */
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [setTheme]);
}
