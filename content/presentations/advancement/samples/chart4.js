import React from 'react';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory';
import fp from 'lodash/fp';
import xs from 'xstream';

import { TeX } from '../../../src/components/tex';
import theme from '../../../src/assets/main-theme';
import useDeck from '../../../src/hooks/use-deck';

import { red, green, blue } from './utils';
import dataPd from './data.json';

/**
 * parse the data
 */
const { T, dataP, dataQ: preDataQ } = (
  dataPd
  .reduce((acc, { T, a, b, points, version, slide, sample }) => {
    if (slide !== 4) return acc;
    const obj = acc.T ? acc : { T, a, b };
    const dt = T / (points.length - 1);
    return (
      fp.set(`data${version}[${sample}]`)
      (points.map((y, i) => ({ x: i * dt, y })))
      (obj)
    );
  }, {})
);
const M = dataP.length;
const dataPUsual = dataP.map(line => ({
  line,
  passed: line.some(({ y }) => y > 1),
}));
const dataPRare = dataP.map(line => ({
  line,
  passed: line.some(({ x, y }) => x < 1 && y > 1),
}));
const dataQ = preDataQ.map(line => ({
  line,
  passed: line.some(({ x, y }) => x < 1 && y > 1),
}));

/**
 * our component
 */
function MonteCarlo() {
  // use the deck to see which fragment we are on
  const step = useDeck(
    state => fp.get(`fragments[${state.index}][${state.step - 1}]`)(state)
  );
  const index = Number.isFinite(step) ? step + 1 : 0;

  // create a hook which samples at some rate
  const [count, setCount] = React.useState(0);
  const [wasAhead, setWasAhead] = React.useState(false);
  React.useEffect(() => {
    if (index <= 1) {
      setCount(0);
      setWasAhead(false);
    } else if (index === 2 && !wasAhead) {
      setCount(1);
      const sample$ = xs.periodic(250).map(s => s + 2).take(M - 1)
      const listener = { next: setCount };
      sample$.addListener(listener);
      return () => sample$.removeListener(listener);
    } else {
      setCount(M);
      setWasAhead(true);
    }
  }, [setCount, setWasAhead, wasAhead, index]);

  // if we are before fragments, do not render
  if (!index) return null;

  // create the lines we render
  const samples = (index <= 2 ? dataPUsual : dataPRare).slice(0, count);
  const renderLines = samples.map(({ line, passed }, i) => (
    <VictoryLine 
      key={ i }
      data={ line } 
      domain={{ y: [0, 1.5] }}
      style={{ 
        data: { stroke: passed ? green : red, opacity: i === count ? 1 : 0.5 } 
      }} />
  ));

  // set aspect/scale of graph
  const aspect = 0.35;
  const width = 800;
  const height = aspect * width;

  // render the graph
  return (
    <div style={{ position: 'relative' }}>
      <VictoryChart
        width={ width }
        height={ height }
        theme={ theme }
        padding={{ top: 10, right: 10, bottom: 50, left: 10 }}>
        <VictoryAxis 
          tickValues={ fp.range(0, T+1) } 
          tickFormat={ t => t === T ? "T" : (t === 1 && index >= 3 ? "S" : '') } 
          domain={ [0, 1.1 * T] }/>
        <VictoryAxis 
          dependentAxis
          tickValues={ [] }
          tickFormat={ () => '' }
          domain={ [0, 1.5] } />
        <VictoryLine
          domain={{ y: [0, 1.5] }}
          style={{ data: { stroke: blue } }} 
          data={[
            { x: 0, y: 1 }, 
            { x: index <= 2 ? T : 1, y: 1 },
          ]}
          animate={{ onLoad: 0, duration: 250 }}
        />
        { renderLines }
      </VictoryChart>
      <TeX block style={{ display: !count ? 'none': 'inherit' }}>
        {
          String.raw`
            \frac{1}{${count}} \sum_{i=1}^{${count}} 1_A(X^i(\omega)) 
            = \frac{${samples.reduce((acc, { passed }) => acc + (passed ? 1 : 0), 0)}}{${count}}
          `
        }
      </TeX>
        <div style={{ 
          position: 'absolute', 
          left: '600px', 
          top: '360px',
          display: index === 4 ? 'inherit' : 'none',
        }}>
        <div style={{ 
          zIndex: -1,
          position: 'absolute',
          left: '-48px',
          top: '-10px',
          width: '41px', 
          background: 'yellow',
          height: '80px' }} />
        <div style={{ color: 'red' }}>
          What if <TeX>{ String.raw`\rmP(X \in A) = 10^{-6}` }</TeX>?
        </div>
      </div>
    </div>
  );
}

function ImportanceSampling() {
  // use the deck to see which fragment we are on
  const step = useDeck(
    state => fp.get(`fragments[${state.index}][${state.step - 1}]`)(state)
  );
  const index = (Number.isFinite(step) && step >= 2) ? step - 1 : 0;


  // if we are before fragments, do not render
  if (!index) return null;

  // create the lines we render
  const samples = index <= 1 ? dataPRare : dataQ;
  const renderLines = samples.map(({ line, passed }, i) => (
    <VictoryLine 
      key={ i }
      data={ line } 
      domain={{ x: [0, 1.5], y: [0, 1.5] }}
      style={{ 
        data: { stroke: passed ? green : red, opacity: 0.5 }
      }} />
  ));

  // set aspect/scale of graph
  const aspect = 0.35;
  const width = 800;
  const height = aspect * width;

  // render the graph
  return (
    <div style={{ position: 'relative' }}>
      <VictoryChart
        width={ width }
        height={ height }
        theme={ theme }
        domain={{ x: [0, 1.5], y: [0, 1.5] }}
        padding={{ top: 10, right: 10, bottom: 50, left: 10 }}>
        <VictoryAxis 
          tickValues={ [1] }
          tickFormat={ () => 'S' }
          domain={ [0, 1.5] }/>
        <VictoryAxis 
          dependentAxis
          tickValues={ [] }
          tickFormat={ () => '' }
          domain={ [0, 1.5] } />
        <VictoryLine
          domain={{ y: [0, 1.5] }}
          style={{ data: { stroke: blue } }} 
          data={[
            { x: 0, y: 1 }, 
            { x: 1, y: 1 },
          ]}
          animate={{ onLoad: 0, duration: 250 }}
        />
        { renderLines }
      </VictoryChart>
      <div style={{ position: 'relative', display: index === 3 ? 'inherit' : 'none', marginTop: '-2em' }}>
        <TeX block>
          {
            String.raw`
              \frac{1}{10} \sum_{i=1}^{10} w(X^i(\omega)) 1_A(X^i(\omega)) = 9.381 \times 10^{-7}
            `
          }
        </TeX>
      </div>
    </div>
  );
}

export { MonteCarlo, ImportanceSampling };
