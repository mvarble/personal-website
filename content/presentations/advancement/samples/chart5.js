import React from 'react';
import fp from 'lodash/fp';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory';
import xs from 'xstream';

import { TeX } from '../../../src/components/tex';
import theme from '../../../src/assets/main-theme';

import dataPd from './data.json';

/**
 * parse the data
 */
const { T, samplesByEpsilon } = (
  dataPd
  .filter(row => row.slide === 5)
  .reduce((acc, { T, sample, epsilon, points }) => {
    const obj = acc.T ? acc : { T };
    const dt = T / (points.length - 1);
    return (
      fp.set(`samplesByEpsilon[${epsilon}][${sample}]`)
      (points.map((y, i) => ({ x: i * dt, y })))
      (obj)
    );
  }, {})
);

/**
 * our component
 */
export default function AsymptoticRegime() {
  // create a hook which samples at some rate
  const [epsilon, setEpsilon] = React.useState(0);
  React.useEffect(() => {
    const M = samplesByEpsilon.length;
    const stream$ = (
      xs
      .periodic(100)
      .map(k => Math.min(k % (M + 3), M - 1))
    );
    const listener = { next: setEpsilon };
    stream$.addListener(listener);
    return () => stream$.removeListener(listener);
  }, [setEpsilon]);

  // create the lines we render
  const renderLines = samplesByEpsilon[epsilon].map((samples, i) => (
    <VictoryLine 
      key={ i } 
      data={ samples } 
      style={{
        data: { 
          stroke: `hsl(${180 + 370 * i / samplesByEpsilon.length}, 100%, 45%)`,
        },
      }}
    />
  ));

  // set aspect/scale of graph
  const aspect = 0.65;
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
          tickFormat={ t => t === T ? 'T' : '' } 
          domain={ [0, 1.1 * T] }/>
        <VictoryAxis 
          dependentAxis
          tickValues={ [] }
          tickFormat={ () => '' }
          domain={ [0, 5] } />
        { renderLines }
      </VictoryChart>
      <TeX block style={{ position: 'absolute', bottom: '50px', display: 'block', right: '10px' }}>
        { String.raw`{\rm d}X^\epsilon_t = b(X^\epsilon_t) {\rm d}t + \sqrt{\epsilon}\sigma(X^\epsilon_t) {\rm d}W_t` }
      </TeX>
    </div>
  );
}
