import React from 'react';
import { 
  VictoryChart, 
  VictoryLegend,
  VictoryAxis,
  VictoryLine, 
} from 'victory';

import data from './data.json';
import { TeX } from '../../../src/components/tex';
import theme from '../../../src/assets/main-theme';

// choose colors
export const colors = [
  'hsl(40, 100%, 45%)', 
  'hsl(160, 100%, 35%)', 
  'hsl(280, 100%, 45%)',
];

export default function Comparisons({ ldp, ...props }) {
  // create a state for choosing delta
  const [delta, setDelta] = React.useState(1.1);

  // create an array which dictates the order of the actual/approximations
  const types = ['Actual', 'CLT', 'LDP'];

  // memoize the data so that it only changes on delta
  const lines = React.useMemo(() => types.map(name => ({
    type: name,
    data: data.filter(r => (
      r.type === name 
      && Math.abs(r.delta - delta) < 0.01
      && r.val > 1e-16
    )),
  })), [delta, types]);

  // change aspect/scale of graph
  const aspect = 0.35;
  const width = 800;
  const height = aspect * width;

  // render
  return (
    <div { ...props }>
      <VictoryChart 
        width={ width }
        height={ height }
        padding={{ 
          top: 10,
          right: 10,
          bottom: 50,
          left: 80,
        }}
        scale={{ x: 'linear', y: 'log' }}
        style={{ border: { padding: 0 } }}
        theme={ theme }>
        <VictoryAxis
          tickValues={ Array(40).fill(null).map((_, i) => i + 10) }
          label="n"
          style={{ 
            axisLabel: { 
              padding: 30, 
              fill: 'var(--main)', 
              fontSize: 16,
              fontWeight: 'bold',
            },
          }}
        />
        <VictoryAxis 
          dependentAxis 
          label="tail probability"
          style={{ 
            axisLabel: { 
              padding: 50, 
              fill: 'var(--main)', 
              fontSize: 16,
              fontWeight: 'bold',
            },
          }}/>
        {
          lines.map(({ type, data }, i) => (
            (type === 'LDP' && !ldp)
            ? null
            : <VictoryLine 
              key={ type } 
              data={ data } 
              style={{ data: { stroke: colors[i] } }}
              x="n" 
              y="val" />
          ))
        }
        <VictoryLegend
          x={ 0.9 * width }
          y={ 0.1 * height }
          data={
            types
            .filter(name => name !== 'LDP' || ldp)
            .map((name, i) => ({ name, symbol: { fill: colors[i] } }))
          }
          gutter={20}
          style={{ 
            border: { stroke: 'var(--body)', fill: 'white' }, 
            data: { fontSize: '10pt' },
          }}
        />
      </VictoryChart>
      <div style={{ display: 'flex', marginTop: '1em' }}>
        <div style={{ flex: '0% 1 1' }} />
        <TeX>{ String.raw`\delta = ${Number(delta).toFixed(2)}` }</TeX>
        <input 
          type="range" 
          value={ delta }
          min={ 1.1 } 
          max={ 3 } 
          step={ 0.1 } 
          style={{ marginLeft: '1em' }}
          onChange={ e => setDelta(e.target.value) }/>
        <div style={{ flex: '0% 1 1' }} />
      </div>
    </div>
  );
}
