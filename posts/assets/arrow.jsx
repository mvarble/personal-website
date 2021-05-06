import React from 'react';
import * as THREE from 'three';

function Arrow3DBufferGeometry({ origin=[0, 0, 0], disp=[1, 0, 0], ...props }) {
  // create a ref for the geometry
  const ref = React.useRef();

  // update the geometry whenever props change
  React.useEffect(() => {
    /**
     * Create the mesh which is to be transformed through an isometry
     */
    const dispVec = new THREE.Vector3(...disp);
    const L = dispVec.length();
    const tipLength = 0.5;
    const tipOffset = 0.25;
    const bar = 0.05;
    const verts = [
      /* bottom rectangle */
      0, -bar, -bar,
      L - tipLength, -bar, -bar,
      L - tipLength, bar, -bar,
      //
      L - tipLength, bar, -bar,
      0, bar, -bar,
      0, -bar, -bar,
      //
      /* left rectangle */
      0, -bar, -bar,
      L - tipLength, -bar, -bar,
      L - tipLength, -bar, bar,
      //
      L - tipLength, -bar, bar,
      0, -bar, -bar,
      0, -bar, bar,
      //
      /* top rectangle */
      0, -bar, bar,
      L - tipLength, -bar, bar,
      L - tipLength, bar, bar,
      //
      L - tipLength, bar, bar,
      0, -bar, bar,
      0, bar, bar,
      //
      /* right rectangle */
      0, bar, bar,
      0, bar, -bar,
      L - tipLength, bar, -bar,
      //
      L - tipLength, bar, -bar,
      0, bar, bar,
      L - tipLength, bar, bar,
      //
      /* right offset */
      L - tipLength, bar, bar,
      L - tipLength, tipOffset, tipOffset,
      L - tipLength, tipOffset, -tipOffset,
      //
      L - tipLength, tipOffset, -tipOffset,
      L - tipLength, bar, bar,
      L - tipLength, bar, -bar,
      //
      /* bottom offset */
      L - tipLength, bar, -bar,
      L - tipLength, tipOffset, -tipOffset,
      L - tipLength, -bar, -bar,
      //
      L - tipLength, -bar, -bar,
      L - tipLength, tipOffset, -tipOffset,
      L - tipLength, -tipOffset, -tipOffset,
      //
      /* left offset */
      L - tipLength, -tipOffset, -tipOffset,
      L - tipLength, -bar, -bar,
      L - tipLength, -bar, bar,
      //
      L - tipLength, -bar, bar,
      L - tipLength, -tipOffset, -tipOffset,
      L - tipLength, -tipOffset, tipOffset,
      //
      /* top offset */
      L - tipLength, -tipOffset, tipOffset,
      L - tipLength, tipOffset, tipOffset,
      L - tipLength, -bar, bar,
      //
      L - tipLength, -bar, bar,
      L - tipLength, bar, bar,
      L - tipLength, tipOffset, tipOffset,
      //
      /* tip */
      L - tipLength, tipOffset, tipOffset,
      L - tipLength, tipOffset, -tipOffset,
      L, 0, 0,
      //
      L, 0, 0,
      L - tipLength, tipOffset, -tipOffset,
      L - tipLength, -tipOffset, -tipOffset,
      //
      L - tipLength, -tipOffset, -tipOffset,
      L, 0, 0,
      L - tipLength, -tipOffset, tipOffset,
      //
      L - tipLength, -tipOffset, tipOffset,
      L - tipLength, tipOffset, tipOffset,
      L, 0, 0,
    ];

    /**
     * create the affine map
     */
    const matrix = (new THREE.Matrix4()).compose(
      new THREE.Vector3(...origin),
      (new THREE.Quaternion()).setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        dispVec.normalize(),
      ),
      new THREE.Vector3(1, 1, 1),
    );

    /**
     * set the attributes
     */
    if (ref.current.attributes.position) {
      ref.current.attributes.position.set(verts);
      ref.current.attributes.position.applyMatrix4(matrix);
      ref.current.attributes.position.needsUpdate = true;
    } else {
      ref.current.setAttribute(
        'position',
        (new THREE.Float32BufferAttribute(verts, 3)).applyMatrix4(matrix),
      )
    }
  }, [origin, disp]);

  // render
  return <bufferGeometry ref={ref} { ...props }/>;
}

function Arrow3D({ origin=[0, 0, 0], disp=[1, 0, 0], color='red', ...props }) {
  return (
    <mesh { ...props }>
      <Arrow3DBufferGeometry origin={ origin } disp={ disp } attach="geometry"/>
      <meshBasicMaterial 
        args={ [{ side: 2 }] } 
        color={ color } 
        attach="material" />
    </mesh>
  );
}

export default Arrow3D;
