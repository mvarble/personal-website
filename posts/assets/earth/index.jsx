import React from 'react';
import * as THREE from 'three';

import exposedColorMap from './earth_atmos_2048.jpg';
import culledColorMap from './earth_lights_2048.png';
import specularMap from './earth_specular_2048.jpg';
import normalMap from './earth_normal_2048.jpg';

export default function Earth({ children, ...props }) {
  // textures
  const [textures, setTextures] = React.useState({})
  const { exposedColor, culledColor, specular, normal } = textures;

  // load textures
  React.useEffect(() => {
    // load textures
    const textureLoader = new THREE.TextureLoader();
    setTextures({
      exposedColor: textureLoader.load(exposedColorMap),
      culledColor: textureLoader.load(culledColorMap),
      specular: textureLoader.load(specularMap),
      normal: textureLoader.load(normalMap),
    });
  }, [setTextures]);

  // render
  return (
    <object3D { ...props }>
      <mesh>
        <sphereBufferGeometry args={ [1.0, 64, 64] } />
        <meshPhongMaterial 
          side={ THREE.DoubleSide }
          specular={ 0x333333 }
          shininess={ 10 }
          map={ exposedColor }
          specularMap={ specular }
          normalMap={ normal }
          normalScale={ [0.85, 0.85] }
          emissive="white"
          emissiveMap={ culledColor }
        />
        { children }
      </mesh>
    </object3D>
  );
}
