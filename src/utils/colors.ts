export type ColorChoices = (
  'pink' 
  | 'orange' 
  | 'sky' 
  | 'green' 
  | 'teal' 
  | 'yellow' 
  | 'purple' 
  | 'text' 
  | 'background'
);

export interface Colors {
  pink: string;
  pinkDark: string;
  orange: string;
  orangeDark: string;
  sky: string;
  skyDark: string;
  green: string;
  greenDark: string;
  teal: string;
  tealDark: string;
  yellow: string;
  yellowDark: string;
  purple: string;
  purpleDark: string;
  text: string;
  textDark: string;
  background: string;
  backgroundDark: string;
};

export interface Palette {
  pink: string;
  pinkAlt: string;
  orange: string;
  orangeAlt: string;
  sky: string;
  skyAlt: string;
  green: string;
  greenAlt: string;
  teal: string;
  tealAlt: string;
  yellow: string;
  yellowAlt: string;
  purple: string;
  purpleAlt: string;
  text: string;
  textAlt: string;
  background: string;
  backgroundAlt: string;
};

export const colors: Colors = {
  pink: '#DB2777',
  pinkDark: '#F9A8D4',
  orange: '#EA580C',
  orangeDark: '#FDBA74',
  sky: '#0284C7',
  skyDark: '#7DD3FC',
  green: '#16A34A',
  greenDark: '#86EFAC',
  teal: '#0D9488',
  tealDark: '#5EEAD4',
  yellow: '#CA8A04',
  yellowDark: '#FDE047',
  purple: '#9333EA',
  purpleDark: '#D8B4FE',
  text: '#0F172A',
  textDark: '#CBD5E1',
  background: '#E7E5E4',
  backgroundDark: '#27272A',
};

import { Theme } from './themes';
export function colorsByTheme(theme: Theme): Palette {
  return {
    pink: theme === Theme.Dark ? colors.pinkDark : colors.pink,
    pinkAlt: theme === Theme.Dark ? colors.pink : colors.pinkDark,
    orange: theme === Theme.Dark ? colors.orangeDark : colors.orange,
    orangeAlt: theme === Theme.Dark ? colors.orange : colors.orangeDark,
    sky: theme === Theme.Dark ? colors.skyDark : colors.sky,
    skyAlt: theme === Theme.Dark ? colors.sky : colors.skyDark,
    green: theme === Theme.Dark ? colors.greenDark : colors.green,
    greenAlt: theme === Theme.Dark ? colors.green : colors.greenDark,
    teal: theme === Theme.Dark ? colors.tealDark : colors.teal,
    tealAlt: theme === Theme.Dark ? colors.teal : colors.tealDark,
    purple: theme === Theme.Dark ? colors.purple : colors.purpleDark,
    purpleAlt: theme === Theme.Dark ? colors.purpleDark : colors.purple,
    yellow: theme === Theme.Dark ? colors.yellowDark : colors.yellow,
    yellowAlt: theme === Theme.Dark ? colors.yellow : colors.yellowDark,
    text: theme === Theme.Dark ? colors.textDark : colors.text,
    textAlt: theme === Theme.Dark ? colors.text : colors.textDark,
    background: theme === Theme.Dark ? colors.backgroundDark : colors.background,
    backgroundAlt: theme === Theme.Dark ? colors.background : colors.backgroundDark,
  };
}
