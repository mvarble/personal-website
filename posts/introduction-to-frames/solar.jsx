import React from 'react';
import * as THREE from 'three';
import { Canvas, useUpdate, useThree } from 'react-three-fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { animationFrameScheduler, interval } from 'rxjs';
import { map, scan, skip } from 'rxjs/operators';

import TeX from '../../src/components/tex';
import { Diagram, timers$ } from './diagrams';
import { useSpace } from './cubemaps';
import Earth from './earth';

/**
 * constants
 */
const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;
const D = 5.0;
const R = 1.0;
const ALPHA = 23.45 * PI / 180;
const DAYS = 10;

/**
 * angular timeframes
 */
const omegaD = t => 2 * PI * t;
const omegaY = t => omegaD(t) / DAYS;

/**
 * frames
 */
const fus = t => new THREE.Matrix4().set(
  cos(omegaY(t)), 0, sin(omegaY(t)), 0,
  0, 1, 0, 0,
  -sin(omegaY(t)), 0, cos(omegaY(t)), 0,
  0, 0, 0, 1
);

const fse = t => new THREE.Matrix4().set(
  cos(omegaY(t)), 0, -sin(omegaY(t)), D,
  0, 1, 0, 0,
  sin(omegaY(t)), 0, cos(omegaY(t)), 0,
  0, 0, 0, 1
);

const fees = new THREE.Matrix4().set(
  cos(ALPHA), -sin(ALPHA), 0, 0,
  sin(ALPHA), cos(ALPHA), 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
);

const feed = t => new THREE.Matrix4().set(
  R * cos(omegaD(t)), 0, R * sin(omegaD(t)), 0,
  0, R, 0, 0,
  -R * sin(omegaD(t)), 0, R * cos(omegaD(t)), 0,
  0, 0, 0, 1
);

const toLong = theta => PI * (180-theta) / 180;
const toLat = phi => PI * (phi - 90) / 180;

const feep = (phi, theta) => {
  const lat = toLat(phi);
  const long = toLong(theta);
  return new THREE.Matrix4().set(
    -sin(long), cos(lat) * cos(long), sin(lat) * cos(long), sin(lat) * cos(long),
    0, -sin(lat), cos(lat), cos(lat),
    cos(long), cos(lat) * sin(long), sin(lat) * sin(long), sin(lat) * sin(long),
    0, 0, 0, 1
  );
};

/**
 * React components
 */
function Environment() {
  // use the cubemap
  const texture = useSpace();
  const { scene } = useThree();
  React.useEffect(() => {
    scene.background = texture;
  }, [texture, scene]);
  return null;
}

function AnimatedFrame({ time=5000, pause=500, functions }) {
  // create an animation state
  const [state, set] = React.useState({});
  React.useEffect(() => {
    const observable$ = timers$(time, pause).pipe(
      scan(({ points }, { part, progress, pause }) => {
        const matrix = functions.reduce(
          (prod, mat) => prod.multiply(mat(progress)),
          new THREE.Matrix4(),
        );
        const deleteHistory = pause > 0.5;
        const newPoints = (
          deleteHistory 
          ? [] 
          : [...points, new THREE.Vector3(0, 0, 0).applyMatrix4(matrix)]
        );
        return { part, matrix, points: newPoints };
      }, { points: [] }),
    );
    const subscription = observable$.subscribe({ next: set});
    return () => subscription.unsubscribe();
  }, [set, time, pause]);

  // update references as according to state
  const frame = useUpdate(obj => {
    if (!state.matrix) return;
    obj.matrix = state.matrix;
    obj.matrixAutoUpdate = false;
    obj.matrixWorldNeedsUpdate = true;
  }, [state]);

  const line = useUpdate(obj => {
    if (!state.points) return;
    obj.setFromPoints(state.points);
  }, [state]);

  // render
  return (
    <group>
      <Environment />
      <line>
        <bufferGeometry ref={ line }/>
        <lineBasicMaterial color="white" />
      </line>
      <object3D ref={ frame }>
        <axesHelper size={ 10 } />
      </object3D>
    </group>
  );
}

function EarthYear() {
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera position={ [0, 12, 8] } makeDefault />
        <OrbitControls enableDamping={ false } />
        <AnimatedFrame 
          functions={ 
            [t => fus(t * DAYS), t => fse(t * DAYS)]
          } />
      </Canvas>
      <span>
        <i>(Interact above)</i> Dynamics of earth throughout year visualized with $F_y(t)$. 
        The astronomical scale $D$ taken smaller for visualization purposes.
      </span>
    </Diagram>
  );
}
export { EarthYear };

function EarthTilt() {
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera position={ [0, 12, 8] } makeDefault />
        <OrbitControls enableDamping={ false } />
        <AnimatedFrame 
          functions={ 
            [t => fus(t * DAYS), t => fse(t * DAYS), t => fees]
          } />
      </Canvas>
      <span>
        <i>(Interact above)</i> Introduce tilt of earth's polar axis with { String.raw`$F_a(t)$`}.
      </span>
    </Diagram>
  );
}
export { EarthTilt };

function EarthSpin() {
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera position={ [0, 12, 8] } makeDefault />
        <OrbitControls enableDamping={ false } />
        <AnimatedFrame 
          functions={ [
            t => fus(t * DAYS), 
            t => fse(t * DAYS), 
            t => fees, 
            t => feed(t * DAYS),
          ] } />
      </Canvas>
      <span>
        <i>(Interact above)</i> Intoduce earth's spin with $F_d(t)$.
        Note that the number of days in a year $\omega_d/\omega_y$ is smaller for visualization purposes.
      </span>
    </Diagram>
  );
}
export { EarthSpin };

function Slider({ prop, set, min, max, name, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '1em', flexWrap: 'wrap' }}>
      <span style={{ paddingRight: '0.5em', fontWeight: 'bold' }}>
        <TeX>{ `$${name}$` }</TeX>:
      </span>
      <input 
        value={ prop }
        onChange={ e => set(+e.target.value) }
        type="range" 
        min={ min } 
        max={ max } 
        step={ 0.0001 } 
        style={{ flexGrow: 1 }}/>
      { children }
    </div>
  );
}

function SliderDeg({ prop, set, min, max, name, sides }) {
  const val = Math.abs(+prop).toFixed(4);
  const str = prop < 0 ? sides[0] : sides[1];
  return (
    <Slider prop={ prop } set={ set } min={ min } max={ max } name={ name }>
      <span style={{ margin: '0.5em', width: '100px' }}>
        <TeX>{ String.raw`$${val}^\circ\,\text{${str}}$` }</TeX>
      </span>
    </Slider>
  );
}

function PersonFrame({ phi, theta }) {
  const frame = useUpdate(obj => {
    obj.matrixAutoUpdate = false;
    obj.matrixWorldNeedsUpdate = true;
    obj.matrix = feep(phi, theta);
  }, [phi, theta]);
  return (
    <object3D ref={ frame }>
      <axesHelper size={ 10 } />
    </object3D>
  );
}

function MapCoordinates() {
  // create a coordinate state
  const [phi, setPhi] = React.useState(36.1378);
  const [theta, setTheta] = React.useState(-115.1619);
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}>
        <Environment />
        <Earth />
        <PerspectiveCamera position={ [5, 0, 5] } makeDefault>
          <pointLight intensity={ 5 } />
        </PerspectiveCamera>
        <OrbitControls enableDamping={ false } />
        <PersonFrame phi={ phi } theta={ theta }/>
      </Canvas>
      <div>
        <SliderDeg name="\phi" prop={ phi } set={ setPhi } min={ -90 } max={ 90 } sides={['S', 'N']} />
        <SliderDeg name="\theta" prop={ theta } set={ setTheta } min={ -180 } max={ 180 } sides={['W', 'E']} />
        <div>
          <i>(Interact above)</i> { String.raw`For fixed (longitude, latitude) parameters $(\phi, \theta)$, the transform $T_p(\phi, \theta)$ maps a frame onto the sphere.` }
        </div>
      </div>
    </Diagram>
  );
}
export { MapCoordinates };

function EarthPosition() {
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera position={ [0, 12, 8] } makeDefault />
        <OrbitControls enableDamping={ false } />
        <AnimatedFrame 
          time={ 10000 }
          functions={ [
            t => fus(t * DAYS), 
            t => fse(t * DAYS), 
            t => fees, 
            t => feed(t * DAYS),
            t => feep(36.1378, -115.1619),
          ] } />
      </Canvas>
      <span>
        <i>(Interact above)</i> { String.raw`For a fixed position $(\phi, \theta)$ in (latitude, longitude) coordinates, the frame $F_p(t, \phi, \theta)$ now demonstrates the complicated path of a person in the solar system. Note again that the astronomical scale and number of days in a year are distorted.` }
      </span>
    </Diagram>
  );
}
export { EarthPosition };
