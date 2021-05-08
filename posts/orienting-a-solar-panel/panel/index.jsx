import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Canvas, useThree, useUpdate } from 'react-three-fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import { Matrix4, Vector3 } from 'three';

import TeX from '../../../src/components/tex';
import { useOutside } from '../../../posts/assets/cubemaps';
import Arrow from '../../../posts/assets/arrow';
import gltfPath from './panel.gltf';

const ALPHA = Math.PI / 2 - Math.atan(5/18);
const L = 5.1;

const PanelObject = React.forwardRef(({ name, ...props }, ref) => {
  // load the gltf data
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(gltfPath, object => {
      const index = object.scene.children.findIndex(c => c.name === name);
      if (index >= 0) {
        setData(object.scene.children[index]);
      }
    });
  }, [setData, name]);

  // render the object
  return data && <primitive { ...props } object={ data } ref={ ref }/>;
});

const Panel = React.forwardRef(({ children, ...props }, ref) => {
  const texture = useOutside();
  React.useEffect(() => {
    if (ref.current) {
      ref.current.material.envMap = texture;
    }
  });

  // render
  return (
    <PanelObject name="panel_1" { ...props } ref={ ref }>
      { children }
    </PanelObject>
  );
});

function Chimney(props) {
  return <PanelObject name="chimney" { ...props } />;
}

function Roof(props) {
  return <PanelObject name="roof" { ...props } />;
}

function Environment({ solarVec }) {
  // effect: change env
  const { scene } = useThree();
  const texture = useOutside();
  React.useEffect(() => {
    scene.background = texture;
  }, [scene, texture]);

  // create the directional light
  const light = React.useRef();
  const target = React.useRef();
  React.useEffect(() => {
    if (!light.current || !target.current) return;
    light.current.target = target.current;
  });

  // render
  return (
    <>
      <ambientLight intensity={ 0.66 } color="#fafaff" />
      <directionalLight 
        ref={ light } 
        intensity={ 5 } 
        color="#ffefdd" 
        position={ solarVec.map(x => -10 * x) }/>
      <object3D ref={ target } />
    </>
  );
}

function DemonstratePower({ solarLabel="r", panelLabel="p" }) {
  // create a ref for the panel
  const panel = React.useRef();

  // create a state for the panel angle that the user may change
  const [panelAngle, setPanelAngle] = React.useState(0);

  // calculate the height of the panel so that it looks physically correct
  const y = L * Math.sin(ALPHA + panelAngle) / Math.sin(ALPHA);

  // the solar vector (in building coordinates)
  const solarVec = [2, -2, -4]

  // calculate the dot product for power
  const { SolarArrow, dot } = React.useMemo(() => {
    // get the matrix for the solar panel frame relative to parent
    const matrix = (
      panel.current
      ? panel.current.matrix
      : (new Matrix4())
    );

    // invert the matrix
    const matrixInverse = matrix.clone().invert();

    // calculate the solar vector in panel coordinates
    const disp = (new Vector3(...solarVec))
      .applyMatrix4(matrixInverse)
      .sub((new Vector3()).applyMatrix4(matrixInverse))

    // always put the solar vector's tip at the panel
    const origin = (new Vector3(0, -L/2, 0)).sub(disp);

    // the panel vector is [0, 0, 1] in panel coordinates
    const dot = -disp.dot(new Vector3(0, 0, 1));
    
    // return the objects
    return {
      dot,
      SolarArrow: (
        <group>
          <Arrow origin={ origin.toArray() } disp={ disp.toArray() } color="#ff5000"/>
            <Html position={ origin.toArray() }>
            <TeX style={{ color: '#ff5000' }}>{ `$${solarLabel}$` }</TeX>
          </Html>
        </group>
      ),
    };
  }, [solarVec, solarLabel, panel]);

  // render the interactive scene
  return (
    <div style={{ position: 'relative' }}> 
      <div style={{ margin: '1em', fontWeight: 'bold', position: 'absolute', zIndex: 1 }}>
        <span style={{ paddingRight: '0.5em' }}>
          power <TeX>{ String.raw`$-\langle ${solarLabel}, ${panelLabel} \rangle$` }</TeX>:
        </span>
        <svg width={ 180 } height={ 12 }>
          <rect 
            width={ dot * 25 } 
            height={ 12 }
            style={{ fill: 'green', stroke: 'black' }}
          />
        </svg>
      </div>
      <Canvas style={{ height: 500 }} >
        <group rotation={ [0, 3.5, 0] }>
          <PerspectiveCamera position={ [12, 4, 8] } makeDefault />
          <group position={ [15, 0, -10] } rotation={ [0, -Math.PI/3, 0] }>
            <Environment solarVec={ solarVec }/>
            <Chimney />
            <Panel 
              position={ [0, y, 2] } 
              rotation={ [-panelAngle, 0, 0] } 
              ref={ panel }>
              <Arrow origin={ [0, -L/2, 0] } disp={ [0, 0, 3] } color="green"/>
              <Html position={ [0, -L/2, 4] }>
                <TeX style={{ color: 'green' }}>{ `$${panelLabel}$` }</TeX>
              </Html>
              { SolarArrow }
            </Panel>
            <Roof />
          </group>
        </group>
      </Canvas> 
      <div style={{ display: 'flex', alignItems: 'center', margin: '1em' }}>
        <span style={{ paddingRight: '0.5em', fontWeight: 'bold' }}>angle:</span>
        <input 
          value={ panelAngle }
          onChange={ e => setPanelAngle(+e.target.value) }
          type="range" 
          min={ 0 } 
          max={ Math.PI - ALPHA } 
          step={ 0.01 } 
          style={{ flexGrow: 1 }}/>
      </div>
    </div>
  );
}

export { DemonstratePower };

function DemonstrateControl() {
  const [beta, setBeta] = React.useState(0);
  const [gamma, setGamma] = React.useState(0);
  return (
    <div>
      <Canvas style={{ height: '300px', background: '#d8eff4' }} >
        <DemonstrateControlScene beta={ beta } gamma={ gamma } />
      </Canvas>
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
      In the view above, the camera is looking towards the north.
    </div>
  );
}
export { DemonstrateControl };

function DemonstrateControlScene({ beta, gamma }) {
  const ref = useUpdate(obj => {
    const matrix = new Matrix4().set(
      Math.cos(beta), -Math.sin(beta) * Math.sin(gamma), -Math.sin(beta) * Math.cos(gamma), 0,
      0, Math.cos(gamma), -Math.sin(gamma), 0,
      Math.sin(beta), Math.cos(beta) * Math.sin(gamma), Math.cos(beta) * Math.cos(gamma), 0,
      0, 0, 0, 1
    );
    obj.matrix = matrix;
    obj.matrixAutoUpdate = false;
    obj.matrixWorldNeedsUpdate = true;
  }, [beta, gamma]);

  const panelRef = React.useRef();

  return (
    <group rotation={ [0, 3.5, 0] }>
      <PerspectiveCamera position={ [12, 4, 3] } makeDefault />
      <ambientLight intensity={ 0.66 } color="#fafaff" />
      <directionalLight 
        intensity={ 5 } 
        color="#ffefdd" />
      <group position={ [12, 3, -10] }>
        <group ref={ ref } >
          <Panel position={ [0, 0, 2.55] } rotation={ [Math.PI/2, Math.PI, 0] } ref={ panelRef }/>
        </group>
      </group>
    </group>
  );
}
