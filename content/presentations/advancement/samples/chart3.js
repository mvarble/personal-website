import React from 'react';
import xs from 'xstream';
import { Line, Circle, VictoryLine } from 'victory';

import data from './data.json';

/**
 * Our component we compose in for the animation
 */

function useAnimate(time, N) {
  // create and manage a state for the curve animation
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const time$ = xs.periodic(time).take(N);
    const listener = { next: setCount };
    time$.addListener(listener);
    return () => time$.removeListener(listener);
  }, [setCount, time, N]);

  // return state
  return count;
}

function StochasticProcess({ points, T, domain, ...props }) {
  // get the count
  const count = useAnimate(T, points.length);

  // render the animation
  return (
    <div { ...props }>
      <div style={{ margin: '0 2em' }}>
        <VictoryLine 
          width={ 500 } 
          height={ 500 } 
          domain={ domain }
          padding={ 0 }
          data={ points.slice(0, count).map(([x, y], t) => ({ t, x, y })) } 
          sortKey="t" />
      </div>
    </div>
  );
}

/**
 * Brownian motion
 */
const brownian = data.find(row => row.slide === 3 && row.name === 'brownian');
function BrownianMotion(props) {
  return (
    <StochasticProcess 
      { ...props }
      points={ brownian.points }
      T={ brownian.T }
      domain={{ x: [-2.5, 1.5] , y: [-3, 1] }}/>
  );
}
export { BrownianMotion };

/**
 * (square) Bessel
 */
function Bessel(props) {
  // initialize the animation state
  const { points } = brownian;
  const count = useAnimate(50, 2000);

  // set the domain
  const domain = { x: [-3, 1] , y: [-3, 1] };

  // memoize the VictoryLine for fast render
  const line = React.useMemo(() => (
    <VictoryLine 
      width={ 400 } 
      height={ 400 }
      padding={ 0 }
      domain={ domain }
      data={ points.map(([x, y], t) => ({ t, x, y })) }
      standalone={ false }
      sortKey="t" />
  ), []); // eslint-disable-line

  // get the point position and radius from origin
  const [x, y] = count ? points[count - 1] : [0, 0]
  const d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

  // transform to Victory coordinates (whatever they are)
  const cx = 100 * (3 + x);
  const cy = 100 * (1 - y);
  const r =  100 * d;
  
  // render Brownian with a circle
  return (
    <div { ...props }>
      <div style={{ margin: '0 2em' }}>
        <svg width={ 500 } height={ 500 } viewBox="0 0 500 500">
          <g>{ line }</g>
          <rect width={ 20 } height={ r } y={ 300 - r } x={ 380 } style={{ fill: 'green' }} />
          <Circle cx={ 300 } cy={ 100 } r={ r } style={{ fill: 'none', stroke: 'red' }} />
          <Circle cx={ 300 } cy={ 100 } r="3" style={{ fill: 'red' }} />
          <Line x1={ 300 } y1={ 100 } x2={ cx } y2={ cy } style={{ stroke: 'red' }} />
          <Circle cx={ cx } cy={ cy } r="3" style={{ fill: 'red' }} />
        </svg>
      </div>
    </div>
  );
}
export { Bessel };

/**
 * Ornstein-Uhlenbach
 */
const ou = data.find(row => row.slide === 3 && row.name === 'ou');
function OrnsteinUhlenbach(props) {
  return (
    <StochasticProcess 
      { ...props }
      points={ ou.points }
      T={ ou.T }
      domain={{ x: [-2, 6] , y: [-4, 1] }}/>
  );
}
export { OrnsteinUhlenbach };

/**
 * CIR
 */
function toGraph(object) {
  const dt = object.T / (object.points.length - 1);
  return {
    ...object,
    points: object.points.map((x, i) => [i * dt, x[0]]),
  };
}

const cir = toGraph(data.find(row => row.slide === 3 && row.name === 'cir'))
function CIR(props) {
  return (
    <StochasticProcess 
      { ...props }
      points={ cir.points }
      T={ cir.T }
      domain={{ x: [0, 5] , y: [-0.1, 4.9] }}/>
  );
}
export { CIR };

/**
 * Poisson
 */
const poisson = toGraph(
  data
  .filter(row => row.slide === 3 && row.name === 'poisson')
  .map(row => ({ ...row, points: row.points.filter((x, i) => i % 5 === 0) }))
  [0]
)
function Poisson(props) {
  return (
    <StochasticProcess 
      { ...props }
      points={ poisson.points }
      T={ poisson.T }
      domain={{ x: [0, 5] , y: [-0.1, 4.9] }}/>
  );
}
export { Poisson };


/**
 * Levy
 */
const levy = data.find(row => row.slide === 3 && row.name === 'levy');
function Levy(props) {
  return (
    <StochasticProcess 
      { ...props }
      points={ levy.points }
      T={ levy.T }
      domain={{ x: [-10, 10] , y: [-10, 10] }}/>
  );
}
export { Levy };

/**
 * Branching with immigration
 */
const branching =  toGraph(data.find(row => row.slide === 3 && row.name === 'branching'))
function Branching(props) {
  return (
    <StochasticProcess 
      { ...props }
      points={ branching.points }
      T={ branching.T }
      domain={{ x: [0, 5] , y: [-0.1, 30] }}/>
  );
}
export { Branching };

/**
 * Hawkes
 */
const hawkes = (
  data
  .filter(row => row.slide === 3 && row.name === 'hawkes')
  .map(({ T, jumps, times, a, b, x0 }) => {
    const N = 1000;
    return {
      T,
      points: (
        Array(N + 1).fill(null).map((_, i) => {
          const t = T * i / N;
          const y = (
            a + (x0 - a) * Math.exp(-b * t) +
            times.reduce((acc, time, k) => (
              time < t
              ? acc + jumps[k] * Math.exp(-b * (t - time))
              : acc
            ), 0)
          );
          return [t, y];
        })
      ),
    };
  })
  [0]
);
function Hawkes(props) {
  return (
    <StochasticProcess 
      { ...props }
      points={ hawkes.points }
      T={ hawkes.T }
      domain={{ x: [0, 5] , y: [5, 20] }}/>
  );
}
export { Hawkes };
