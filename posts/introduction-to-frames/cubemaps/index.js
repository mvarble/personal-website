import React from 'react';
import * as THREE from 'three';

import outside from './outside';
import space from './space';

function useCubemap(array) {
  return React.useMemo(() => {
    const loader = new THREE.CubeTextureLoader();
    return loader.load(array);
  }, []); // eslint-disable-line
}

const useOutside = () => useCubemap(outside);
const useSpace = () => useCubemap(space);

export {
  useOutside,
  useSpace,
};
