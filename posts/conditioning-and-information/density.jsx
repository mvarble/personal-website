import React from 'react';
import { ParametricBufferGeometry } from 'three';
import { Canvas, useUpdate } from 'react-three-fiber';
import { Line, PerspectiveCamera, OrbitControls, Html } from '@react-three/drei';

import TeX from '../../src/components/tex';

function Surface({ domain, func, stepsU, stepsV, color }) {
  // whenever domain or density update, create the new parameterization
  const parameterization = React.useMemo(() => {
    const [[xMin, xMax], [yMin, yMax]] = domain;
    return (u, v, w) => {
      const s = xMin + u * (xMax - xMin);
      const t = yMin + v * (yMax - yMin);
      w.set(...func(s, t));
    };
  }, [domain, func]);

  // imperatively update parametric buffer geometry
  const ref = useUpdate(obj => {
    const tmp = new ParametricBufferGeometry(parameterization, stepsU, stepsV);
    tmp.dispose();
    obj.attributes = tmp.attributes;
  }, [parameterization, stepsU, stepsV]);

  // render the tree
  return (
    <mesh>
      <parametricBufferGeometry 
        args={ [(u, v, w) => w, stepsU, stepsV] } 
        ref={ ref } />
      <meshStandardMaterial 
        side={ 2 } 
        transparent={ true } 
        opacity={ 0.5 } 
        color={ color } />
    </mesh>
  );
}

function Axes() {
  return (
    <group>
      <Line points={ [[0, 0, 1], [0, 0, 0], [1, 0, 0]] } />
      <Line points={ [[0, 1, 0], [0, 0, 0]] } />
      <Html position={ [1, 0, 0] }><TeX>$x$</TeX></Html>
      <Html position={ [0, 1, 0] }><TeX>$z$</TeX></Html>
    </group>
  );
}

export default function Density({ 
  domain = [[-1, 1], [-1, 1]], 
  density = (x, y) => (
    0.5 
    + 0.2 * Math.pow(x, 2) * Math.sin(y * 2.1) 
    + 0.3 * Math.sin(y / 3.0)
  ),
  stepsU = 100,
  stepsV = 100,
  ...props
}) {
  // create a state for the current z-value
  const [z, setZ] = React.useState(0.8);

  // memoize some points on marginal change
  const [xMin, xMax] = domain[1];
  const points = React.useMemo(() => Array(stepsU+1).fill().map((_, i) => {
    const x = xMin + (xMax - xMin) * i / stepsU;
    return [x, z, density(x, z)];
  }), [xMin, xMax, stepsU, density, z]);

  return (
    <div 
      { ...props } 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        ...(props.style || {}) 
      }}>
      <Canvas style={{ height: '200px' }}>
        <ambientLight intensity={ 0.5 } />
        <PerspectiveCamera up={ [0, 0, 1] } position={ [2, 2, 2] } makeDefault>
          <pointLight intensity={ 0.5 } />
        </PerspectiveCamera>
        <OrbitControls enableDamping={ false } />
        <Axes />
        <Surface 
          domain={ domain } 
          func={ (x, y) => [x, y, density(x, y)] } 
          stepsU={ stepsU } 
          stepsV={ stepsV } 
          color="#8080ff"
        />
        <Surface 
          domain={ [domain[1], [0, 1]] } 
          func={ (x, y) => [x, z, y * density(x, z)] } 
          stepsU={ stepsU } 
          stepsV={ stepsV } 
          color="#ff8080"
        />
        <Line points={ points } color="red" />
        <Html 
          style={{ fontSize: '8pt', color: '#8080ff' }} 
          position={ [0, -1, 1] }>
          <TeX>{ `$\\operatorname{graph}(p)$` }</TeX>
        </Html>
      </Canvas>
      <input 
        type="range" 
        onChange={ e => setZ(e.target.value) } 
        value={ z } 
        min={ -1 } 
        max={ 1 } 
        step={ 0.1 } />
    </div>
  );
}
