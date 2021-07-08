import create from 'zustand';
import fp from 'lodash/fp';

const useUI = create(set => ({
  navbarHidden: false,
  hideNavbar: bool => set(fp.set('navbarHidden')(bool)),
  margin: 80,
  setMargin: num => set(fp.set('margin')(num))
}));

export default useUI;
