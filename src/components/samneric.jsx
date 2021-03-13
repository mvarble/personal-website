import React from 'react';
import { Spring, config } from 'react-spring/renderprops';

import sam from '../../assets/sam.jpg'
import eric from '../../assets/eric.jpg'

function Name({ children }) {
  return (
    <Spring 
      config={ config.wobbly }
      reset={ true }
      duration={ 0.5 }
      from={{ transform: 'rotate(-45deg)' }} 
      to={{ transform: 'rotate(45deg)' }}>
      { 
        props => (
          <span style={{ 
            ...props, 
            color: 'red', 
            position: 'absolute',
            fontWeight: 'bold',
            fontSize: '30pt',
          }}>{ children }</span>
        )
      }
    </Spring>
  );
}

function Box({ name, src }) {
  const [mouse, setMouse] = React.useState();
  return (
    <div 
      style={{ display: 'inline-block' }} 
      onMouseOver={ () => setMouse(true) }
      onMouseOut ={ () => setMouse(false) }
    >
      { mouse ? <Name>{ name }</Name> : null }
      <img alt="sam" src={ src } width={ 230 } style={{ border: '3px solid var(--link)', marginRight: '1em' }} />
    </div>
  );
}


export default function Samneric() {
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ flex: '0% 1 1' }} />
      <div>
        <Box name="Sam!" src={ sam } />
        <Box name="Eric!" src={ eric } />
      </div>
      <span style={{ flex: '0% 1 1' }} />
    </div>
  );
}
