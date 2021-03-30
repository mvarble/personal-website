import React from 'react';
import { Link } from 'gatsby';

import RatLogo from '../../assets/rat';

export default function Navbar() {
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
    <nav className="navbar is-success">
      <div className="navbar-brand">
        <Link 
          to="/" 
          className="navbar-item" 
          style={{ position: 'relative' }}  
          { ...events }>
          <RatLogo width="80" style={{ position: 'absolute', ...visibleIf(rat)}}/>
          <span style={ visibleIf(!rat) }>rat.supply</span>
        </Link>
        <Link to="/search" className="navbar-item" style={{ padding: '0 1em' }} state={ {} }>
          <i className="fas fa-search"></i>
        </Link>
      </div>
    </nav>
  );
}


