import React from 'react';
import { Link } from 'gatsby';

import { Theme } from '../utils/themes';
import { useTheme, useChangeTheme } from '../hooks/use-theme';
import { ContentContainer, Content, PreContent, PostContent } from './content';
import RatLogo from './rat';
import Toggle from './toggle';

function Nav() {
  // create a state for the nav menu
  const [hover, setHover] = React.useState(false);
  const hoverOn = () => setHover(true);
  const hoverOff = () => setHover(false);

  // create interaction events
  const events = { 
    onFocus: hoverOn,
    onBlur: hoverOff,
    onMouseOver: hoverOn,
    onMouseOut: hoverOff,
  };

  // render
  return ( 
    <div className="h-full">
      <Link 
        to="/"
        className={ 
          `h-full flex py-1 text-white dark:text-white text-center hover:bg-white/25 relative` }
        { ...events }>
        <span className={ `relative flex m-auto ${hover ? 'visible' : 'invisible'}` }>rodent.club</span>
        <RatLogo 
          className={ `h-3/4 pt-1 pl-4 absolute ${!hover ? 'visible' : 'invisible'}` }

          />
      </Link>
    </div>
  );
}

function ThemeToggle() {
  // interface with the theme to get the toggle status
  const theme = useTheme();

  // create effect for clicking on toggle
  const changeTheme = useChangeTheme();

  return (
    <Toggle 
      onLogo={ <span className="flex flex-col w-full blue-300 justify-center"><i className="fa-solid fa-moon"></i></span>}
      offLogo={ <span className="flex flex-col w-full text-yellow-600 justify-center"><i className="fa-solid fa-sun"></i></span>  }
      onClick={ changeTheme } 
      on={ theme === Theme.Dark }/>
  );
}

export default function Navbar({ title }: { title: string }) {
  return (
    <nav 
      className="fixed top-0 h-16 w-full 
      select-none
      backdrop-blur border-b 
      bg-green-800/50 border-stone-700 
      dark:bg-green-800/50 dark:border-neutral-900">
      <div className="h-full">
        <div className="flex flex-row h-full justify-items-center px-4">
          <Nav />
          <span className="text-white text-xl font-bold px-4 pt-5">{ title }</span>
          <div className="flex-1" />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
