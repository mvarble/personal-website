import React from 'react';
import { Canvas, useUpdate } from 'react-three-fiber';
import { 
  OrbitControls,
  PerspectiveCamera,
  Line,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { interpolateSpectral, interpolateArray } from 'd3';
import { animationFrameScheduler, interval } from 'rxjs';
import { map, concatMap, takeWhile } from 'rxjs/operators';

import Arrow from './arrow';
import { scene } from './index.module.scss';
import TeX from '../../src/components/tex';

function R3Diagram() {
  return (
    <div>
      <div className="card" style={{ margin: '1em' }} >
        <div className="card-image">
          <Canvas style={{ background: 'var(--grey)' }}>
            <PerspectiveCamera 
              position={ [2, 2, 1] }
              up={ [0, 0, 1] } 
              makeDefault />
            <OrbitControls enableDamping={ false } />
            <object3D position={ [0, 0, -0.2] }>
              <axesHelper size={ 10 } />
              <Arrow 
                disp={ [1, 4, 5] } 
                scale={ [0.25, 0.25, 0.25] }
                color={ interpolateSpectral(0.5) } />
              <Arrow 
                position={ [0.25, 1, 1.25] } 
                scale={ [0.25, 0.25, 0.25] } 
                disp={ [0.5, 1, -2] } 
                color={ interpolateSpectral(0.75) } />
              <Arrow 
                disp={ [1.5, 5, 3] } 
                scale={ [0.25, 0.25, 0.25] }
                color={ interpolateSpectral(1.0) } />
            </object3D>
          </Canvas>
        </div>
        <div className="card-content">
          <i>(Interact above)</i> Geometry of addition.
        </div>
      </div>
      <div className="card" style={{ margin: '1em' }} >
        <div className="card-image">
          <Canvas style={{ background: 'var(--grey)' }}>
            <PerspectiveCamera 
              position={ [2, 2, 1] }
              up={ [0, 0, 1] } 
              makeDefault />
            <OrbitControls enableDamping={ false } />
            <object3D position={ [0, 0, -0.2] }>
              <axesHelper size={ 10 } />
              <Arrow 
                disp={ [-1, 4, 3] } 
                scale={ [0.25, 0.25, 0.25] }
                color={ interpolateSpectral(0.5) } />
              <Arrow 
                disp={ [-0.5, 2, 1.5] } 
                scale={ [0.25, 0.25, 0.25] }
                color={ interpolateSpectral(1.0) } />
            </object3D>
          </Canvas>
        </div>
        <div className="card-content">
          <i>(Interact above)</i> Geometry of scalar multiplication.
        </div>
      </div>
    </div>
  );
}
export { R3Diagram }

function Diagram({ children }) {
  return (
    <div style={{ margin: '1em' }}>
      <div className={ `${scene} card` } style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-image">
          { Array.isArray(children) ? children[0] : null }
        </div>
        <div className="card-content">
          { Array.isArray(children) ? children.slice(1) : null }
        </div>
      </div>
    </div>
  );
}
export { Diagram };

const samMatrix = new THREE.Matrix4()
  .makeRotationFromEuler(new THREE.Euler(-1, 0, 2))
  .setPosition(-1, 1, 2);

function SamFrame({ children }) {
  const samFrame = useUpdate(obj => {
    obj.matrix = samMatrix;
    obj.matrixAutoUpdate = false;
    obj.matrixWorldNeedsUpdate = true;
  }, []);
  return (
    <object3D ref={ samFrame }>
      <axesHelper />
      { children }
    </object3D>
  );
}

function TwoFrameDiagram() {
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera 
          position={ [5, 5, 5] }
          up={ [0, 0, 1] } 
          makeDefault />
        <OrbitControls enableDamping={ false } />
        <axesHelper position={ [1, -1, -2] } />
        <SamFrame />
      </Canvas>
      <span>
        <i>(Interact above)</i> Each rat is centered where three colored lines meet.
          A step in the directions <span style={{ color: 'red' }}>right</span>, <span style={{ color: 'green' }}>forward</span>, and <span style={{ color: 'blue' }}>upward</span> will place the rat at the end of the <span style={{ color: 'red' }}>red</span>, <span style={{ color: 'green' }}>green</span>, and <span style={{ color: 'blue' }}>blue</span> line segments, respectively.
      </span>
    </Diagram>
  );
}
export { TwoFrameDiagram };

function ChickenLocation() {
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera 
          position={ [10, 10, 10] }
          up={ [0, 0, 1] } 
          makeDefault />
        <OrbitControls enableDamping={ false } />
        <axesHelper position={ [1, -1, -2] } />
        <SamFrame>
          <Line 
            dashed={ true }
            color={ interpolateSpectral(0.5) } 
            points={[[0,0,0], [4.2,0,0], [4.2, 6.9, 0], [4.2, 6.9, 6.66]]} />
          <Line 
            dashed={ true }
            color={ interpolateSpectral(0.5) } 
            points={[[0,0,0], [4.2, 6.9, 0]]} />
          <Html position={ [2.1, 0, 0] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>$4.2$</TeX>
          </Html>
          <Html position={ [4.2, 3.45, 0] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>$6.9$</TeX>
          </Html>
          <Html position={ [4.2, 6.9, 3.33] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>$6.66$</TeX>
          </Html>
          <mesh position={ [4.2, 6.9, 6.66] }>
            <meshBasicMaterial color={ interpolateSpectral(0.5) } />
            <sphereBufferGeometry args={ [0.25, 32, 32] } /> 
          </mesh>
        </SamFrame>
      </Canvas>
      <span>
        <i>(Interact above)</i> The location of the chicken, relative to Sam's frame of reference.
      </span>
    </Diagram>
  );
}
export { ChickenLocation };

function timers$(time, pause) {
  return interval(0, animationFrameScheduler).pipe(
    concatMap(part => {
      const startTime = animationFrameScheduler.now();
      return interval(0, animationFrameScheduler).pipe(
        map(_ => {
          const t = animationFrameScheduler.now() - startTime;
          return { 
            part,
            progress: Math.min(t / time, 1.0),
            pause: Math.max(0.0, Math.min((t - time) / pause, 1.0)),
          };
        }),
        takeWhile(d => d.pause < 1.0)
      );
    }),
  );
}
export { timers$ };

function EricAtSam({ time=500 }) {
  // create the animation timing
  const [position, setPosition] = React.useState(undefined);
  React.useEffect(() => {
    const observable$ = timers$(time, time).pipe(map(({ part, progress }) => (
      (part % 3) === 0
      ? interpolateArray([1, -1, -2], [-1, -1, -2])(progress)
      : ((part % 3) === 1
        ? interpolateArray([-1, -1, -2], [-1, 1, -2])(progress)
        : interpolateArray([-1, 1, -2], [-1, 1, 2])(progress)
      )
    )));
    const subscription = observable$.subscribe({ next: setPosition });
    return () => subscription.unsubscribe();
  }, [setPosition, time]);

  // render
  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera 
          position={ [10, 10, 10] }
          up={ [0, 0, 1] } 
          makeDefault />
        <OrbitControls enableDamping={ false } />
        <axesHelper position={ [1, -1, -2] }>
          <Line
            dashed={ true }
            color={ interpolateSpectral(0.5) }
            points={ [[0,0,0], [-2,0,0], [-2, 2, 0], [-2, 2, 4]] }/>
          <Line
            dashed={ true }
            color={ interpolateSpectral(0.5) }
            points={ [[0,0,0], [-2, 2, 0]] }/>
          <Html position={ [-1, 0, 0] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>$x$</TeX>
          </Html>
          <Html position={ [-2, 1, 0] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>$y$</TeX>
          </Html>
          <Html position={ [-2, 2, 2] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>$z$</TeX>
          </Html>
        </axesHelper>
        <SamFrame>
          <mesh position={ [4.2, 6.9, 6.66] }>
            <meshBasicMaterial color={ interpolateSpectral(0.5) } />
            <sphereBufferGeometry args={ [0.25, 32, 32] } /> 
          </mesh>
        </SamFrame>
        <axesHelper position={ position } />
      </Canvas>
      <span>
        <i>(Interact above)</i> Eric must move $x$ steps right, $y$ steps forward, and $z$ steps up to get to Sam.
      </span>
    </Diagram>
  );
}
export { EricAtSam };

function EricRightStep({ time=500 }) {
  const step = React.useMemo(() => (new THREE.Vector4(1, 0, 0, 0))
    .applyMatrix4(samMatrix)
    .toArray()
    .slice(0, 3), []);

  // create the animation timing
  const [position, setPosition] = React.useState([0, 0, 0]);
  React.useEffect(() => {
    const observable$ = timers$(time, time).pipe(map(({ part, progress }) => (
      (part % 3) === 0
      ? interpolateArray([-1, 1, 2], [-1 + step[0], 1, 2])(progress)
      : ((part % 3) === 1
        ? interpolateArray(
          [-1 + step[0], 1, 2], 
          [-1 + step[0], 1 + step[1], 2])(progress)
        : interpolateArray(
          [-1 + step[0], 1 + step[1], 2], 
          [-1 + step[0], 1 + step[1], 2 + step[2]])(progress)
      )
    )));
    const subscription = observable$.subscribe({ next: setPosition });
    return () => subscription.unsubscribe();
  }, [setPosition, step, time]);

  return (
    <Diagram>
      <Canvas style={{ height: '350px' }}> 
        <PerspectiveCamera 
          position={ [1, 1, 1] }
          up={ [0, 0, 1] } 
          makeDefault />
        <OrbitControls enableDamping={ false } />
        <object3D position={ [1, -1, -2] }>
          <SamFrame />
          <axesHelper position={ position } />
          <Line
            color={ interpolateSpectral(0.5) }
            points={ [
              [-1, 1, 2], 
              [-1 + step[0], 1, 2], 
              [-1 + step[0], 1 + step[1], 2],
              [-1 + step[0], 1 + step[1], 2 + step[2]]
            ] } />
          <Line
            color={ interpolateSpectral(0.5) }
            points={ [[-1, 1, 2], [-1 + step[0], 1 + step[1], 2]] } />
          <Html position={ [-1 + step[0] / 2, 1, 2] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>{ String.raw`$a_{11}$` }</TeX>
          </Html>
          <Html position={ [-1 + step[0], 1 + step[1] / 2, 2] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>{ String.raw`$a_{21}$` }</TeX>
          </Html>
          <Html position={ [-1 + step[0], 1 + step[1], 2 + step[2] / 2] }>
            <TeX style={{ 
              color: interpolateSpectral(0.5),
            }}>{ String.raw`$a_{31}$` }</TeX>
          </Html>
        </object3D>
      </Canvas>
      <span>
        <i>(Interact above)</i> { String.raw`
          A displacement $(a_{11}, a_{21}, a_{31})$ for Eric is the same as a step right for Sam.
        `}
      </span>
    </Diagram>
  );
}
export { EricRightStep };

function Translation({ time=500, pause=1500 }) {
  // create an animation state
  const [position, setPosition] = React.useState([0, 0, 0]);
  React.useEffect(() => {
    const observable$ = timers$(time, pause).pipe(
      map(({ progress, pause }) => (
        pause < 0.5 
        ? interpolateArray([0, 0, 0], [1, 3, -2])(progress)
        : [0, 0, 0]
      ))
    );
    const subscription = observable$.subscribe({ next: setPosition });
    return () => subscription.unsubscribe();
  }, [setPosition, time, pause]);

  // render
  return (
    <Diagram>
      <Canvas style={{ height: '200px' }}> 
        <PerspectiveCamera 
          position={ [4, 4, 4] }
          up={ [0, 0, 1] } 
          makeDefault />
        <OrbitControls enableDamping={ false } />
        <object3D position={ [-0.5, -1.5, 1] }>
          <axesHelper position={ position } />
        </object3D>
      </Canvas>
      <span>
        <i>(Interact above)</i> Translating a frame.
      </span>
    </Diagram>
  );
}
export { Translation };

function Rotation({ time=500, pause=1500 }) {
  // create an animation state
  const [rotation, setRotation] = React.useState([0, 0, 0]);
  React.useEffect(() => {
    const observable$ = timers$(time, pause).pipe(map(({ pause, progress }) => (
      pause < 0.5
      ? interpolateArray([0, 0, 0], [Math.PI/2, 1, -0.5])(progress)
      : [0, 0, 0]
    )));
    const subscription = observable$.subscribe({ next: setRotation });
    return () => subscription.unsubscribe();
  }, [setRotation, time, pause]);

  // render
  return (
    <Diagram>
      <Canvas style={{ height: '200px' }}> 
        <PerspectiveCamera 
          position={ [2, 2, 2] }
          up={ [0, 0, 1] } 
          makeDefault />
        <OrbitControls enableDamping={ false } />
        <axesHelper rotation={ rotation } />
      </Canvas>
      <span>
        <i>(Interact above)</i> Rotating a frame.
      </span>
    </Diagram>
  );
}
export { Rotation };

function Scale({ time=500, pause=1500 }) {
  // create an animation state
  const [scale, setScale] = React.useState([1, 1, 1]);
  React.useEffect(() => {
    const observable$ = timers$(time, pause).pipe(map(({ progress, pause}) => (
      pause < 0.5
      ? interpolateArray([1, 1, 1], [2.0, 0.2, 1.2])(progress)
      : [1, 1, 1]
    )));
    const subscription = observable$.subscribe({ next: setScale });
    return () => subscription.unsubscribe();
  }, [setScale, time, pause]);

  // render
  return (
    <Diagram>
      <Canvas style={{ height: '200px' }}> 
        <PerspectiveCamera 
          position={ [2, 2, 2] }
          up={ [0, 0, 1] } 
          makeDefault />
        <OrbitControls enableDamping={ false } />
        <axesHelper scale={ scale } />
      </Canvas>
      <span>
        <i>(Interact above)</i> Scaling a frame.
      </span>
    </Diagram>
  );
}
export { Scale };
