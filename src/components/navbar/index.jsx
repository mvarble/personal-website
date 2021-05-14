import React from 'react';
import { Link } from 'gatsby';

import { navbar, above } from './index.module.scss';
import RatLogo from '../../../assets/rat';

function Logo() {
  const [rat, setRat] = React.useState(true);
  const onHover = () => setRat(false);
  const onNoHover = () => setRat(true);
  const events = { 
    onFocus: onHover,
    onBlur: onNoHover,
    onMouseOver: onHover,
    onMouseOut: onNoHover,
  };
  const visibleIf = (bool) => ({ visibility: bool ? 'visible' : 'hidden' });
  return ( 
    <Link 
      to="/" 
      className="navbar-item" 
      style={{ position: 'relative' }}  
      { ...events }>
      <RatLogo width="80" style={{ position: 'absolute', ...visibleIf(rat)}}/>
      <span style={ visibleIf(!rat) }>rat.supply</span>
    </Link>
  );
}

export default function Navbar({ scrollOffset=200, margin=80 }) {
  // create a state and listener for whether or not the navbar shows
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    // if we are not in the dom, this is unnecessary
    if (!document) return

    // create a callback for scrolls
    let lastScroll = document.documentElement.scrollTop;
    let scroll = lastScroll;
    const scrollCallback = () => {
      // store the last spot since a direction change
      const tmp = document.documentElement.scrollTop;
      if (lastScroll < scroll && scroll < tmp) {
        scroll = tmp;
        if (scroll > scrollOffset && scroll > lastScroll + scrollOffset) {
          setHidden(true);
        }
      } else if (tmp < scroll && scroll < lastScroll) {
        scroll = tmp;
        if (scroll < scrollOffset || (scroll < lastScroll - scrollOffset)) {
          setHidden(false);
        }
      } else {
        lastScroll = scroll;
        scroll = tmp;
        if (scroll < scrollOffset) {
          setHidden(false);
        }
      }
    }
    document.addEventListener('scroll', scrollCallback);
    return () => document.removeEventListener('scroll', scrollCallback);
  }, [setHidden, scrollOffset]);
  return (
    <>
      <nav className={ `navbar is-success ${navbar} ${hidden ? above : '' }` }>
        <div className="navbar-brand">
          <Logo />
          <Link to="/search" className="navbar-item" style={{ padding: '0 1em' }} state={ {} }>
            <i className="fas fa-search"></i>
          </Link>
        </div>
      </nav>
      <div style={{ height: `${margin}px` }} />
    </>
  );
}
