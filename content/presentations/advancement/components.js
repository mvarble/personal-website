import React from 'react';

import { 
  orderChanger, 
  order, 
  visible, 
  hidden,
} from './index.module.css';
import { RefTeX } from '../../src/components/tex';

function OrderChanger({ orders, changePause = 1000, opacityPause = 500 }) {
  // current order being shown
  const [i, setI] = React.useState(0);
  const [v, setV] = React.useState(false);

  // change the visibility on interval
  React.useEffect(() => {
    let innerId;
    const id = setInterval(() => {
      setI(i => (i + 1) % orders.length);
      setV(true);
      innerId = setTimeout(() => setV(false), changePause);
    }, changePause + 2 * opacityPause);
    return () => {
      clearInterval(id);
      clearTimeout(innerId);
    }
  }, [setI, setV, changePause, opacityPause, orders]);

  // render
  return (
    <RefTeX>
      <div className={ orderChanger }> 
        <div style={{ flex: '0% 1 1' }} />
        <div>
          { 
            String.raw`
              $\displaystyle \rmP\big(\overline S_n \gt \delta\big) 
              =  1 - \Phi\Bigg(\frac{\sqrt{n}(\delta - \rmE X_1)}{(\var X_1)^{1/2}} \Bigg)$
            ` 
          }
        </div>
        <div className={ order }>
          { 
            orders.map((o, j) => (
              <span 
                key={ j }
                className={ (i === j) ? (v ? visible : '') : hidden }
                style={{ transition: `opacity ${opacityPause / 1000}s` }}>
                { String.raw`$\,+\, o\big(${o}\big)?$` }
              </span>
            )) 
          }
        </div>
        <div style={{ flex: '0% 1 1' }} />
      </div>
    </RefTeX>
  );
}
export { OrderChanger }

function Arrow(props) {
  return (
    <svg viewBox="0 0 348 120"  { ...props } >
      <defs id="defs3771">
      <marker
        style={{ overflow: 'visible' }}
        id="Arrow2Lend"
        refX="0"
        refY="0"
        orient="auto">
      <path
        transform="matrix(-1.1,0,0,-1.1,-1.1,0)"
        d="M 8.7185878,4.0337352 -2.2072895,0.01601326 8.7185884,-4.0017078 c -1.7454984,2.3720609 -1.7354408,5.6174519 -6e-7,8.035443 z"
        style={{
          fill: '#FF0000',
          fillOpacity: 1,
          fillRule: 'evenodd',
          stroke: '#FF0000',
          strokeWidth: 0.625,
          strokeLinejoin: 'round',
          strokeOpacity: 1,
        }}
        id="path4611" />
      </marker>
      <marker
        style={{ overflow: 'visible' }}
        id="Arrow1Lstart"
        refX="0"
        refY="0"
        orient="auto">
      <path
        transform="matrix(0.8,0,0,0.8,10,0)"
        style={{
          fill: '#FF0000',
          fillOpacity:1, 
          fillRule: 'evenodd',
          stroke: '#FF0000',
          strokeWidth: '1pt',
          strokeOpacity: 1,
        }}
        d="M 0,0 5,-5 -12.5,0 5,5 Z"
        id="path4590" />
      </marker>
      </defs>
      <path
        id="path3781"
        d="m 336.98354,26.110203 c 0,0 -257.948402,-86.90736 -329.1385036,87.831917"
        style={{
          fill: 'none',
          stroke: '#FF0000',
          strokeWidth: 2.5,
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit:4,
          strokeDasharray: 'none',
          strokeOpacity: 1,
          markerEnd: 'url(#Arrow2Lend)'
        }}/>
    </svg>
  );
}
export { Arrow };

function VennDiagram(props) {
  return (
    <svg
      width="153mm"
      height="158mm"
      viewBox="0 0 153 158"
      { ...props }>
      <defs id="defs2" />
      <g id="layer1" transform="translate(-46.28389,-63.053071)">
        <ellipse
          style={{
            fill: 'none',
            stroke: 'var(--alt)',
            strokeWidth: 1.05833328,
          }}
          id="path834"
          cx="123.53933"
          cy="175.87605"
          rx="76.155205"
          ry="44.125221" />
        <circle
          style={{
            fill: 'none',
            stroke: 'var(--alt)',
            strokeWidth: 1.05833328,
          }}
          id="path863"
          cx="122.96826"
          cy="134.56885"
          r="36.95929" />
        <circle
          style={{
            fill: 'none',
            stroke: 'var(--alt)',
            strokeWidth: 1.05833328,
          }}
          id="path863-8"
          cx="122.96826"
          cy="134.56885"
          r="21.438606" />
        <circle
          style={{
            fill: 'none',
            stroke: 'var(--alt)',
            strokeWidth: 1.05833328,
          }}
          id="path819"
          cx="122.96826"
          cy="134.56885"
          r="57.868153" />
      </g>
    </svg>
  );
}
export { VennDiagram }
