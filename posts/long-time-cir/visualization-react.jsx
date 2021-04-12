import React from 'react'
import * as d3 from 'd3';
import fp from 'lodash/fp';
import * as math from 'mathjs';

import data from './data.json';

// create a kernel for density estimation
function kernel(x, center, bandwidth) {
  return (
    math.abs(x - center) <= bandwidth
    ? 0.75 * (1 - math.pow((x - center) / bandwidth, 2)) / bandwidth
    : 0.0
  );
}

function Legend({ empiricalColor, trueColor, ...props }) {
  return (
    <g { ...props }>
      <rect fill={ empiricalColor } x={ 0 } y={ -8 } width={ 15 } height={ 8 } />
      <text x={ 20 }>empirical</text>
      <rect fill={ trueColor } x={ 0 } y={ 10 } width={ 15 } height={ 8 } />
      <text x={ 20 } y={ 18 }>limit</text>
    </g>
  );
}

function useAxis(ref, axis, props) {
  React.useEffect(() => {
    const node = d3.select(ref.current).append("g");
    Object.keys(props).forEach(k => node.attr(k, props[k]));
    node.call(axis)
    return () => node.remove();
  }, [ref, axis, props]);
  return ref;
}

function Trajectories({ 
  T,
  samples,
  times,
  trajectoryDims, 
  trajectoryColor, 
  empiricalColor,
  state, 
  set, 
  ...props
}) {
  // calculate the scale
  const timeScale = d3.scaleLinear()
    .domain([0,T])
    .range([0, trajectoryDims[0]]);
  const spaceScale = React.useMemo(() => (
    d3.scaleLinear()
      .domain([0, d3.max(samples, d => 1.05 * d3.max(d, fp.get("xt")))])
      .range([trajectoryDims[1], 0])
  ), [samples, trajectoryDims]);
 
  // memoize the calculation of the line data on index changes
  const line = d3.line().x(r => timeScale(r.t)).y(r => spaceScale(r.xt));
  const dsL = React.useMemo(
    () => samples.map(s => line(s.slice(0, state.index))),
    [line, samples, state.index],
  );
  const dsR = React.useMemo(
    () => samples.map(s => line(s.slice(math.max(state.index-1, 0)))),
    [line, samples, state.index],
  );

  // create the callback which sets the index on mousemove
  const mousemove = React.useCallback(e => {
    const t = timeScale.invert(d3.pointer(e, e.target)[0]);
    const index = d3.bisect(times, t);
    const points = samples.map(s => s[index]);
    set({ index, points });
  }, [samples, times, timeScale, set]);

  // create axes
  const ref = React.useRef();
  useAxis(
    ref,
    d3.axisBottom(timeScale), 
    { transform: `translate(0, ${trajectoryDims[1]})` }
  );
  useAxis(ref, d3.axisLeft(spaceScale), {});

  // render
  return (
    <g ref={ ref } onMouseMove={ mousemove } { ...props }>
      { 
        dsL.map((d, i) => 
          <path 
            key={ i }
            d={ d } 
            stroke={ trajectoryColor }
            strokeOpacity={ 1.0 }
            strokeWidth={ 0.5 }
            fill="none"
          />
        )
      }
      { 
        dsR.map((d, i) => 
          <path 
            key={ i }
            d={ d } 
            stroke={ trajectoryColor }
            strokeOpacity={ 0.5 }
            strokeWidth={ 0.5 }
            fill="none"
          />
        )
      }
      { 
        state.points.map(({ t, xt, sample }) => 
          <circle
            key={ sample }
            cx={ timeScale(t) }
            cy={ spaceScale(xt) }
            r={ 1 }
            fill={ empiricalColor }
            fillOpacity={ 1 } />
        )
      }
    </g>
  );
}

function MGFs({ 
  a,
  b,
  sigma,
  trajectoryDims, 
  paddingRight, 
  paddingTop, 
  metaHeight, 
  trueColor, 
  empiricalColor, 
  state, 
  ...props
}) {
  // create the scale of the MGF plot
  const uMax = 0.5 * (2 * a / math.pow(sigma, 2))
  const uScale = d3.scaleLinear()
    .domain([0, uMax])
    .range([0, (trajectoryDims[0] - paddingRight) / 2]);
  const mgfMax = 50000.0
  const mgfScale = d3.scaleLog()
    .domain([1, mgfMax])
    .range([metaHeight, 0]);

  // memoize the true curve
  const meshSize = 100;
  const trueD = React.useMemo(() => {
    const data = Array(meshSize + 1).fill().map((_, i) => {
      const u = i * uMax / meshSize;
      const expu = math.pow(
        1 - 0.5 * math.pow(sigma, 2) * u / a,
        -2 * a * b / math.pow(sigma, 2)
      );
      return { u, expu }
    }).filter(({ expu }) => expu < mgfMax );
    return d3.line().x(d => uScale(d.u)).y(d =>mgfScale(d.expu))(data);
  }, [uScale, uMax, meshSize, a, b, sigma, mgfScale]);

  // memoize the empirical curve on marginal updates
  const empiricalD = React.useMemo(() => {
    const curveData = Array(meshSize + 1).fill().map((_, i) => {
      const u = i * uMax / meshSize;
      const expu = state.points.reduce(
        (acc, { xt }) => acc + math.exp(u * xt) / state.points.length,
        0
      );
      return { u, expu };
    }).filter(({ expu }) => expu < mgfMax);
    return d3.line().x(d => uScale(d.u)).y(d => mgfScale(d.expu))(curveData);
  }, [uScale, uMax, meshSize, mgfScale, state.points]);

  // create axes
  const ref = React.useRef();
  useAxis(
    ref,
    d3.axisBottom(uScale), 
    { transform: `translate(0, ${metaHeight})` }
  );
  useAxis(ref, d3.axisLeft(mgfScale), {});

  // render
  return (
    <g ref={ ref } { ...props }>
      <path 
        d={ trueD }
        stroke={ trueColor }
        strokeWidth={ 1 }
        fill="none"
      />
      <path 
        d={ empiricalD }
        stroke={ empiricalColor }
        strokeWidth={ 1 }
        fill="none"
      />
      <text y={ -paddingTop / 4 }>moment generating functions</text>
    </g>
  );
}

function Densities({
  trueDensity,
  trajectoryDims,
  paddingRight,
  paddingTop, 
  metaHeight,
  trueColor, 
  empiricalColor,
  bandwidth,
  state,
  ...props
}) {
  // create density scales
  const maxX = 6.0;
  const scaleX = d3.scaleLinear()
    .domain([0, maxX])
    .range([0, (trajectoryDims[0] - paddingRight) / 2]);
  const maxY = 0.8
  const scaleY = d3.scaleLinear()
    .domain([0, maxY])
    .range([metaHeight, 0]);
  const line = d3.line().x(d => scaleX(d.x)).y(d => scaleY(d.y));

  // memoize the true density path
  const meshSize = 100;
  const trueD = React.useMemo(() => {
    const data = Array(meshSize + 1).fill().map((_, i) => {
      const x = i * maxX / meshSize;
      return { x, y: trueDensity(x) };
    });
    return line(data);
  }, [meshSize, maxX, trueDensity, line]);

  // memoize the empirical density path on marginal updates
  const empiricalD = React.useMemo(() => {
    const data = Array(meshSize + 1).fill().map((_, i) => {
      const x = i * maxX / meshSize;
      const y = state.points.reduce(
        (acc, { xt }) => acc + kernel(x, xt, bandwidth) / state.points.length,
        0
      );
      return { x, y };
    }).filter(({ y }) => y < maxY);
    return line(data)
  }, [meshSize, maxX, state.points, bandwidth, maxY, line]);
  
  // create axes
  const ref = React.useRef();
  useAxis(
    ref,
    d3.axisBottom(scaleX), 
    { transform: `translate(0, ${metaHeight})` }
  );

  // render
  return (
    <g ref={ ref } { ...props }>
      <path 
        d={ trueD }
        fill="none"
        stroke={ trueColor }
        strokeWidth={ 1 }/>
      <path 
        d={ empiricalD }
        fill="none"
        stroke={ empiricalColor }
        strokeWidth={ 1 }
      />
      {
        state.points.map(d => 
          <circle
            cx={ scaleX(d.xt) }
            cy={ scaleY(0) }
            r={ 2 }
            fill={ empiricalColor }
            stroke={ empiricalColor }
            fillOpacity={ 0.25 } />
        )
      }
      <text y={ -paddingTop / 4 }>densities</text>
    </g>
  );
}

export default function Visualization(props) {
  // constants that we will not use as props
  const trajectoryDims = [650, 280];
  const metaHeight = 255;
  const paddingTop = 80;
  const paddingRight = 20;
  const margins = { top: 10, right: 30, bottom: 20, left: 40 };
  const bandwidth = 0.5;
  const width = trajectoryDims[0] + margins.left + margins.right;
  const height = trajectoryDims[1] + metaHeight + margins.bottom +
    margins.top + paddingTop;
  const legendPosition = [
    trajectoryDims[0] + margins.left,
    trajectoryDims[1] + paddingTop
  ];
  const mgfPosition = [
    margins.left, 
    margins.top + paddingTop + trajectoryDims[1],
  ];
  const densityPosition = [
    margins.left + paddingRight + trajectoryDims[0] / 2,
    margins.top + paddingTop + trajectoryDims[1],
  ];

  // parse the props
  const {
    trajectoryColor='rgb(150, 180, 255)',
    empiricalColor='green',
    trueColor='red',
  } = props;
  const parsed = React.useMemo(() => {
    const { a, b, sigma } = data;
    const samples = data.samples.map(s => s.filter((_, i) => i % 10 === 0));
    const times = samples[0].map(d => d.t);
    const shape = 2 * a * b / math.pow(sigma, 2);
    const rate = 2 * a / math.pow(sigma, 2);
    return {
      a,
      b,
      sigma,
      shape,
      rate,
      trueDensity: x => (
        math.pow(rate, shape) * math.pow(x, shape - 1) * 
        math.exp(-rate * x) / math.gamma(shape)
      ),
      samples,
      times,
      T: times[times.length - 1],
    };
  }, []);

  // create a state for the current marginal of the trajectory
  const [state, set] = React.useState({ 
    index: 25,
    points: parsed.samples.map(s => s[25]),
  });
 
  // render the svg
  return (
    <svg viewBox={ `0 0 ${width} ${height}` }>
      <Legend 
        { ...parsed }
        empiricalColor={ empiricalColor } 
        trueColor={ trueColor } 
        transform={ `translate(${legendPosition}) rotate(90)` } />
      <Trajectories 
        { ...parsed }
        trajectoryDims={ trajectoryDims } 
        trajectoryColor={ trajectoryColor  }
        empiricalColor={ empiricalColor } 
        state={ state } 
        set={ set }
        transform={ `translate(${margins.left}, ${margins.top})` } />
      <MGFs
        { ...parsed }
        trajectoryDims={ trajectoryDims }
        paddingRight={ paddingRight }
        paddingTop={ paddingTop }
        metaHeight={ metaHeight }
        state={ state }
        empiricalColor={ empiricalColor } 
        trueColor={ trueColor } 
        transform={ `translate(${mgfPosition})` }
      />
      <Densities
        { ...parsed }
        empiricalColor={ empiricalColor } 
        trueColor={ trueColor } 
        trajectoryDims={ trajectoryDims }
        paddingRight={ paddingRight }
        paddingTop={ paddingTop }
        metaHeight={ metaHeight }
        bandwidth={ bandwidth }
        state={ state }
        transform={ `translate(${densityPosition})` }
      />
    </svg>
  );
}



