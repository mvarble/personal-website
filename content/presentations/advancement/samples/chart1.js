import React from 'react';
import { VictoryChart, VictoryAxis, VictoryArea } from 'victory';
import xs from 'xstream';

import { TeX } from '@components/tex';
import theme from '../victory-theme';

import { red, green, blue, inBand, sampleGroupBy, Line } from './utils';
import dataPd from './data.json';

/**
 * Precompute the data
 */

// stratify the data once before render
const lines = dataPd
  .filter(({ slide }) => slide === 1)
  .reduce(sampleGroupBy(row => `[${row.sample}]`), []);

// parse global statistics of said data
const T = Math.max(...(lines.flatMap(sample => sample.map(d => d.t))));
const maxX =  Math.max(...(lines.flatMap(s => s.map(d => d.Xt))));
const { x0, a, b, sigma } = lines[0][0];
const expected = t => -(b - x0) * Math.exp(-a * t) + b;

// create a band from the global data
const upper = t => expected(t) + 3 * Math.sqrt(sigma * t) + 0.5;
const lower = t => expected(t) - Math.sqrt(sigma * t) - 0.5;

// add metadata to each line of if in band
const samplesMeta = lines.map(line => ({ 
  line,
  passed: inBand(line, lower, upper),
}));

// create viewing variables
const N = 500;
const areaData = Array(N + 1).fill(null).map((_, i) => ({
  x: i * T / N,
  y: upper(i * T / N),
  y0: lower(i * T / N),
}));
const yDomain = [0, maxX + 3];

/**
 * Chart1: this shows samples and some arbitrary band
 */
export default function Chart1() {
  // create a sample state
  const [sample, setSample] = React.useState(0);

  // create a stream that will continuously update sample state
  React.useEffect(() => {
    setSample(0);
    const sample$ = xs.periodic(1000);
    const listener = { next: () => setSample(s => (s + 1) % samplesMeta.length) };
    sample$.addListener(listener);
    return () => sample$.removeListener(listener);
  }, [setSample]);

  // parse the current sample
  const { passed, line } = samplesMeta[sample]
  const color = passed ? green : red;

  // set aspect/scale of graph
  const aspect = 0.35;
  const width = 800;
  const height = aspect * width;

  // render a chart with axes and suitable area
  return (
    <div style={{ position: 'relative' }}>
      <VictoryChart 
        width={ width }
        height={ height }
        theme={ theme }
        padding={{ top: 10, right: 10, bottom: 50, left: 10 }}>
        <VictoryAxis 
          tickValues={ Array(parseInt(T)).fill(null).map((_, i) => i+1) } 
          tickFormat={ t => t === T ? "T" : '' } 
          domain={ [0, 1.1 * T] }/>
        <VictoryAxis 
          dependentAxis
          tickValues={ [] }
          tickFormat={ () => '' }
          domain={ yDomain } />
        <VictoryArea 
          domain={{ y: yDomain }}
          style={{ 
            data: { fill: blue, fillOpacity: 0.25, strokeOpacity: 0.25 },
          }} 
          data={ areaData }
        />
        <Line 
          data={ line }
          style={{ data: { stroke: color } }} />
      </VictoryChart>
        <TeX style={{
          color,
          display: 'block',
          position: 'absolute',
          top: `${250 * (1 - line[line.length - 1].Xt / yDomain[1])}px`,
          right: '10px',
        }}>
          { String.raw`X(\omega_{${sample}})` }
        </TeX>
        <TeX style={{
          color: blue,
          display: 'block',
          position: 'absolute',
          top: '70px',
          right: '120px',
        }}>
          A
        </TeX>
    </div>
  );
}
