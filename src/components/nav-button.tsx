import React from 'react';

import { colorsByTheme } from '../utils/colors';
import useTheme from '../hooks/use-theme';
import NavMenu from './nav-menu';
import RatLogo from './rat';

export default function NavButton() {
  // create a state for the nav menu
  const [open, setOpen] = React.useState(false);

  // interface with the theme to get the color
  const theme = useTheme();
  const colors = React.useMemo(() => colorsByTheme(theme), [theme]);

  // create interaction events
  return ( 
    <div className="absolute bottom-4 left-4">
      <NavMenu className="mb-2" open={ open } up />
      <button onClick={ () => setOpen(state => !state) }>
        <RatLogo 
          stroke={ colors.text }
          fill={ colors.background }
          className="transition-all h-14 hover:scale-105" />
      </button>
    </div>
  );
}

