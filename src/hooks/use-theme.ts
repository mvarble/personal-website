import create from 'zustand';
import { Theme, getTheme, updateClass } from '../utils/themes';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const useThemeStore = create<ThemeStore>(set => ({
  theme: getTheme(),
  setTheme: (theme: Theme) => set(state => {
    if (typeof localStorage !== 'undefined') localStorage.theme = theme;
    updateClass();
    return { ...state, theme };
  }),
}));

function useTheme() {
  const theme = useThemeStore(store => store.theme);
  return theme;
}

function useSetTheme() {
  const setTheme = useThemeStore(store => store.setTheme);
  return setTheme;
}

export default useTheme;
export { useTheme, useSetTheme };
