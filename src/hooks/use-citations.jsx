import create from 'zustand';
import fp from 'lodash/fp';

const useCitations = create(set => ({
  numbers: {},
  uses: {},
  setNumbers: obj => set(fp.set('numbers')(obj)),
  reference: (bibKey, id) => set(
    fp.update(`uses[${bibKey}]`)(val => Math.max(val || 0, id))
  ),
}));

export default useCitations;
