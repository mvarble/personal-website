import React from 'react';
import { Canvas, useThree, useUpdate } from 'react-three-fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { scaleLinear, axisBottom, axisLeft, line, select, pointer } from 'd3';
import { Matrix4, Vector3, Vector4 } from 'three';

import TeX from '../../src/components/tex';
import solarFrames from '../../posts/assets/solar-frames';
import Earth from '../../posts/assets/earth';
import Sun from '../../posts/assets/sun';
import { useSpace } from '../../posts/assets/cubemaps';

const D = 1.496e8;
const R = 6371;

const { Tyear, Ttilt, Tday, Tmap, Taction } = solarFrames({
  D,
  R,
  TILT: 23.45 * Math.PI / 180,
  DAYS: 364.24,
});

export default function PowerCurve({ t0, t1, phi, theta }) {
  // the state for control
  const [t, setT] = React.useState(t0);
  const [beta, setBeta] = React.useState(0);
  const [gamma, setGamma] = React.useState(0);

  // return the diagrams
  return (
    <div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '1em' }}>
          <span style={{ paddingRight: '0.5em', fontWeight: 'bold' }}><TeX>{ String.raw`$\beta$` }</TeX></span>
          <input 
            value={ beta }
            onChange={ e => setBeta(+e.target.value) }
            type="range" 
            min={ -Math.PI / 2 } 
            max={ Math.PI / 2 } 
            step={ 0.01 } 
            style={{ flexGrow: 1 }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '1em' }}>
          <span style={{ paddingRight: '0.5em', fontWeight: 'bold' }}><TeX>{ String.raw`$\gamma$` }</TeX></span>
          <input 
            value={ gamma }
            onChange={ e => setGamma(+e.target.value) }
            type="range" 
            min={ -Math.PI / 2 } 
            max={ Math.PI / 2 } 
            step={ 0.01 } 
            style={{ flexGrow: 1 }}/>
        </div>
      </div>
      <Curve 
        t={ t } 
        setT={ setT } 
        t0={ t0 }
        t1={ t1 }
        phi={ phi } 
        theta={ theta } 
        beta={ beta } 
        gamma={ gamma } />
      <Canvas gl={{ logarithmicDepthBuffer: true }} style={{ height: '200px' }}>
        <EarthScene 
          t={ t }
          phi={ phi }
          theta={ theta }
          beta={ beta }
          gamma={ gamma } />
      </Canvas>
    </div>
  );
}

function Curve({ t, t0, t1, setT, phi, theta, beta, gamma }) {
  // create refs for size measuring and d3 stuff
  const divRef = React.useRef();
  const axesRef = React.useRef();

  // our height is constant
  const height = 300;

  // our width depends on the div
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    if (!divRef.current) return;
    setWidth(divRef.current.offsetWidth);
  }, [divRef]);

  // create the scales
  const leftMargin = 25;
  const rightMargin = 10;
  const bottomMargin = 50;
  const topMargin = 10;
  const { xScale, yScale } = React.useMemo(() => {
    const xScale = scaleLinear()
      .domain([t0, t1])
      .range([leftMargin, width - rightMargin]);
    const yScale = scaleLinear()
      .domain([0, 1.1])
      .range([topMargin + height - bottomMargin, topMargin]);
    return { xScale, yScale }
  }, [t0, t1, height, width, leftMargin, rightMargin, bottomMargin, topMargin]);

  // render the axes
  React.useEffect(() => {
    if (!axesRef.current) return;
    select(axesRef.current)
      .append('g')
      .attr('transform', `translate(0, ${topMargin + height - bottomMargin})`)
      .call(axisBottom(xScale));
    select(axesRef.current)
      .append('g')
      .attr('transform', `translate(${leftMargin}, 0)`)
      .call(axisLeft(yScale))
    const cleanup = () => select(axesRef.current).selectAll('*').remove();
    return cleanup;
  }, [axesRef, xScale, yScale, topMargin, leftMargin]);

  // calculate the line data
  const meshCount = 500;
  const { powers, d } = React.useMemo(() => {
    const powers = generatePowers(meshCount, t0, t1, phi, theta, beta, gamma);
    return {
      powers,
      d: line().x(d => xScale(d[0])).y(d => yScale(d[1]))(powers)
    };
  }, [xScale, yScale, t0, t1, phi, theta, beta, gamma, meshCount]);
  const optimalD = React.useMemo(() => line().x(d => xScale(d[0])).y(d => yScale(d[1]))(
    generatePowers(meshCount, t0, t1, phi, theta, 0.011528072862786391, 0.8738099847473886)
  ), [xScale, yScale, t0, t1, phi, theta, meshCount]);

  // create the move callback
  const [i, setI] = React.useState(0);
  const mouseMove = React.useCallback(e => {
    const target = e.target;
    const svg = target.nodeName === 'svg' ? target : target.ownerSVGElement;
    const t = Math.max(t0, Math.min(xScale.invert(pointer(e, svg)[0]), t1));
    const i = Math.round((t - t0) * meshCount / (t1 - t0));
    setT(t);
    setI(i);
  }, [setT, setI, xScale, meshCount, t0, t1]);

  return (
    <div style={{ overflow: 'hidden', height: `${height}px` }} ref={ divRef }>
      <svg viewBox={ `0 0 ${width} ${height}` } onMouseMove={ mouseMove }>
        <g ref={ axesRef } />
        <path d={ optimalD } fill="none" stroke="var(--success)" strokeWidth={ 3 }/>
        <path d={ d } fill="none" stroke="var(--primary)" />
        <circle 
          cx={ xScale(powers[i][0]) } 
          cy={ yScale(powers[i][1]) } 
          r={ 5 } 
          fill="var(--primary)" />
      </svg>
    </div>
  );
}

function generatePowers(meshCount, t0, t1, phi, theta, beta, gamma) {
  return Array(meshCount + 1).fill().map((_, i) => {
    const t = t0 + (t1 - t0) * i / meshCount;
    const solarToMap = new Matrix4()
      .multiply(Tyear(t))
      .multiply(Ttilt)
      .multiply(Tday(t))
      .multiply(Tmap(phi, theta))
      .invert()
    const solarMArray = new Vector4(0, 0, 0, 1)
      .applyMatrix4(solarToMap)
      .toArray()
      .slice(0, 3);
    const radiationM = new Vector3(...solarMArray);
    const solarMLength = radiationM.length();
    radiationM.setLength((D * D) / (solarMLength * solarMLength));
    const panelNormalMArray = new Vector4(0,0,1,0)
      .applyMatrix4(Taction(beta, gamma))
      .toArray()
      .slice(0, 3)
    const panelNormalM = new Vector3(...panelNormalMArray);
    const power = (
      solarMArray[2] >= 0 
      ? Math.max(0, panelNormalM.dot(radiationM)) 
      : 0
    );
    return [t, power];
  });
}

function Environment() {
  // use the cubemap
  const texture = useSpace();
  const { scene } = useThree();
  React.useEffect(() => {
    scene.background = texture;
  }, [texture, scene]);
  return null;
}

function EarthScene({ t, phi, theta, beta, gamma }) {
  const ref = useUpdate(obj => {
    const matrix = new Matrix4()
      .multiply(Tyear(t))
      .multiply(Ttilt)
      .multiply(Tday(t));
    obj.matrixAutoUpdate = false;
    obj.matrixWorldNeedsUpdate = true;
    obj.matrix = matrix;
    const location = obj.children[1];
    location.matrixAutoUpdate = false;
    location.matrixWorldNeedsUpdate = true;
    location.matrix = Tmap(phi, theta);
    const panel = location.children[0].children[0];
    panel.matrixAutoUpdate = false;
    panel.matrixWorldNeedsUpdate = true;
    panel.matrix = Taction(beta, gamma);
  }, [t, phi, theta, beta, gamma]);

  return (
    <group>
      <Environment />
      <Sun />
      <group ref={ ref }>
        <Earth scale={ [R, R, R] } />
        <group>
          <group position={ [0, 0, R] }>
            <group>
              <axesHelper scale={ [R/4, R/4, R/4] } />
            </group>
            <group rotation={ [0, Math.PI/8, 0] }>
              <PerspectiveCamera 
                far={ 3 * R }
                position={ [R/8, 0, R/2] } 
                makeDefault />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
