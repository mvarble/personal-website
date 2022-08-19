import create from 'zustand';
import { Theme, getTheme, updateClass } from '../utils/themes';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  changeTheme: () => void;
}

const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getTheme(),
  setTheme: (theme: Theme) => set(state => {
    if (typeof localStorage !== 'undefined') localStorage.theme = theme;
    updateClass();
    return { ...state, theme };
  }),
  changeTheme: () => {
    const { theme, setTheme } = get();
    if (theme === Theme.Dark) setTheme(Theme.Light);
    else setTheme(Theme.Dark);
  },
}));

function useTheme() {
  const theme = useThemeStore(store => store.theme);
  return theme;
}

function useSetTheme() {
  const setTheme = useThemeStore(store => store.setTheme);
  return setTheme;
}

function useChangeTheme() {
  const changeTheme = useThemeStore(store => store.changeTheme);
  return changeTheme;
}

export default useTheme;
export { useTheme, useSetTheme, useChangeTheme };
