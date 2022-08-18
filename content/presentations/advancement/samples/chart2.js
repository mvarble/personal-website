import React from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryArea } from 'victory';
import xs from 'xstream';
import shallow from 'zustand/shallow';

import { TeX } from '@components/tex';
import theme from '../victory-theme';
import { useDeck } from '@presentations';

import { red, green, blue, inBand, sampleGroupBy, Line } from './utils';
import dataPd from './data.json';

/**
 * Precompute the data
 */

// parse the pandas data
const dataByType = dataPd
  .filter(row => row.slide === 2)
  .reduce(sampleGroupBy(row => `${row.type}[${row.sample}]`), {});

// create the visualization constants
const T = 5;
const yDomain = [0, 10];
const N = 500;

/**
 * Chart: this pre-composes the VictoryChart we repeatedly view
 */
function Chart({ children }) {
  // set aspect/scale of graph
  const aspect = 0.6;
  const width = 400;
  const height = aspect * width;

  // render the chart
  return (
    <VictoryChart 
      width={ width }
      height={ height }
      theme={ theme }
      padding={{ top: 30, right: 10, bottom: 50, left: 10 }}>
      <VictoryAxis 
        tickValues={ Array(parseInt(T)).fill(null).map((_, i) => i+1) } 
        tickFormat={ t => t === T ? "T" : '' } 
        domain={ [0, 1.1 * T] }/>
      <VictoryAxis 
        dependentAxis
        tickValues={ [] }
        tickFormat={ () => '' }
        domain={ yDomain } />
      { children }
    </VictoryChart>
  );
}

/**
 * useReveal: this hook will reveal two samples in sequence
 */
function useReveal(index, startIndex, timeout) {
  // create a state
  const [count, setCount] = React.useState(0);

  // create an effect which resets the animation on index changes
  React.useEffect(() => {
    if (index < startIndex) {
      setCount(0);
    } else if (index === startIndex) {
      setCount(1);
      const sample$ = xs.periodic(timeout).mapTo(2).take(1);
      const listener = { next: setCount };
      sample$.addListener(listener);
      return () => sample$.removeListener(listener);
    } else {
      setCount(2);
    }
  }, [index, startIndex, timeout, setCount]);

  // return the count
  return count;
}

/**
 * Type1: Under some region
 */

// create some data
const linesMetaBound = dataByType.bound.map(line => ({
  line,
  passed: inBand(line, t => 0, t => 6),
}));

// our component
function Bound({ index }) {
  // use the reveal hook to render lines
  const count = useReveal(index, 1, 250);

  // render
  return (
    <>
      <Chart>
        <VictoryArea 
          data={ [{ x: 0, y: 6 }, { x: T, y: 6 }] }
          domain={{ y: yDomain }}
          style={{ 
            data: { fill: blue, fillOpacity: 0.25, strokeOpacity: 0.25 } 
          }}/>
          {
            linesMetaBound.slice(0, count).map(({ line, passed }, i) => (
              <Line 
                key={ i }
                data={ line } 
                style={{ data: { stroke: passed ? green : red } }} />
            ))
          }
      </Chart>
      <TeX style={{
        color: 'orange',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        textAlign: 'center',
      }}>
        { 
          String.raw`
            \displaystyle A 
            = \big\{ y \in \mathbb{R}^{[0,T]} : \lVert y \rVert_\infty \leq r \big\}` 
        }
      </TeX>
    </>
  )
}

/**
 * Type2: Ball
 */

// calculate some data
const candidate = t => 0.25 * Math.pow(t, 2) + 0.5 * t + Math.sin(t);
const areaBall = Array(N + 1).fill(null).map((_, i) => {
  const t = T * i / N;
  const xt = candidate(t);
  return { x: t, y: xt + 2, y0: xt - 2 };
});
const candidatePts = Array(N + 1).fill(null).map((_, i) => ({
  x: T * i / N,
  y: candidate(T * i / N),
}));
const linesMetaBall = dataByType.ball.map(line => ({
  line,
  passed: inBand(line, t => candidate(t) - 2, t => candidate(t) + 2),
}));

// our component
function Ball({ index }) {
  const count = useReveal(index, 3, 250);
  return (
    <>
      <TeX style={{
        color: blue,
        position: 'absolute',
        right: '30px',
        top: '60px',
      }}>x</TeX>
      <Chart>
        <VictoryArea 
          data={ areaBall }
          domain={{ y: yDomain }}
          style={{ 
            data: { fill: blue, fillOpacity: 0.25, strokeOpacity: 0.25 } 
          }}/>
        <VictoryLine 
          data={ candidatePts } 
          style={{ data: { stroke: blue, strokeOpacity: 0.25 } }} />
        {
          linesMetaBall.slice(0, count).map(({ line, passed }, i) => (
            <Line 
              key={ i }
              data={ line } 
              style={{ data: { stroke: passed ? green : red } }} />
          ))
        }
      </Chart>
      <TeX style={{
        color: 'orange',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        textAlign: 'center',
      }}>
        { 
          String.raw`
            \displaystyle A 
            = B_r(x) 
          ` 
        }
      </TeX>
    </>
  );
}

/**
 * Type3/Type4: marginals
 */

// calculate some data
const bands = [ [3, 4.5, 8], [1, 4, 7], [3.5, 4, 9] ];
const marginalAreas = bands.map(([x0, y0, y]) => [
  { x: x0 - 0.025, y, y0 }, 
  { x: x0 + 0.025, y, y0 }
]);

const linesMetaMarginal0 = dataByType.marginal.map(line => ({
  line,
  passed: bands.slice(0, 1).every(([x, y0, y]) => line.every(({ t, Xt }) => (
    t !== x || (y0 <= Xt && Xt <= y)
  )))
}));

const linesMetaMarginal1 = dataByType.marginal.map(line => ({
  line,
  passed: bands.every(([x, y0, y]) => line.every(({ t, Xt }) => (
    t !== x || (y0 <= Xt && Xt <= y)
  )))
}));


function Marginals({ index, number }) {
  const startIndex = number === 0 ? 5 : 7
  const count = useReveal(index, startIndex, 250);
  const marginalCount = number === 0 ? 1 : marginalAreas.length
  const linesMeta = number === 0 ? linesMetaMarginal0 : linesMetaMarginal1;
  return (
    <>
      <Chart>
        {
          marginalAreas.slice(0, marginalCount).map((area, i) => (
            <VictoryArea 
              key={ i } 
              data={ area }
              domain={{ y: yDomain }}
              style={{ 
                data: { fill: blue, fillOpacity: 0.25, strokeOpacity: 0.25 } 
              }}/>
          ))
        }
        {
          linesMeta.slice(0, count).map(({ line, passed }, i) => (
            <Line 
              key={ i }
              data={ line } 
              style={{ data: { stroke: passed ? green : red } }} />
          ))
        }
      </Chart>
      <TeX style={{
        color: 'orange',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        textAlign: 'center',
      }}>
        { 
          number === 0
          ? (
            String.raw`
              \displaystyle A 
              = \pi_t^{-1}\big(B\big)
            `
          )
          : (
            String.raw`
              \displaystyle A 
              = \pi_{\underline t}^{-1}\big(B_1 \times \cdots \times B_n \big)
            `
          )
        }
      </TeX>
    </>
  );
}


/**
 * Chart2: this shows samples and some arbitrary band
 */
export default function Chart2() {
  // interface with deck to get slide state
  const [slideState, getParentSlide] = useDeck(
    deck => [deck.slideState, deck.getParentSlide], 
    shallow,
  );

  // create ref to get slide number
  const ref = React.useRef(null);
  const slideIndex = React.useMemo(() => (
    ref.current
    ? getParentSlide(ref.current)
    : undefined
  ), [getParentSlide, ref.current]);

  // get the index from the slideIndex
  const index = React.useMemo(() => {
    if (!slideState || typeof slideIndex === 'undefined') {
      return 1;
    } else {
      const { indexh, indexf } = slideState;
      if (indexh < slideIndex) return 1;
      else if (indexh > slideIndex) return 6;
      else return indexf + 1;
    }
  }, [slideIndex, slideState]);

  // render a chart with axes and suitable area
  return (
    <div ref={ ref } style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div style={{ width: '50%', flexShrink: 0, position: 'relative' }}>
        <Bound index={ index } />
      </div>
      <div style={{ width: '50%', flexShrink: 0, position: 'relative' }}>
        { index < 2 ? null : <Ball index={ index } /> }
      </div>
      <div style={{ width: '50%', flexShrink: 0, position: 'relative' }}>
        { index < 4 ? null : <Marginals index={ index } number={ 0 } /> }
      </div>
      <div style={{ width: '50%', flexShrink: 0, position: 'relative' }}>
        { index < 6 ? null : <Marginals index={ index } number={ 1 } /> }
      </div> 
    </div>
  );
}
