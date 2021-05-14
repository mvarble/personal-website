import React from 'react';

export default function Sun({ children, ...props }) {
  return (
    <group { ...props }>
      <mesh>
        <meshPhongMaterial emissive={ 0xffbb00 } />
        <sphereBufferGeometry args={ [1, 32, 32] } />
      </mesh>
      <pointLight color="white" intensity={ 5 }/>
      { children }
    </group>
  );
}
