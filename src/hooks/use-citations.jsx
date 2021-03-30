import create from 'zustand';
import fp from 'lodash/fp';

const useCitations = create((set, get) => ({
  citations: [],
  citationUses: {},
  set: citations => set(fp.set('citations')(citations)),
  getNumber: key => {
    const number = get().citations.findIndex(c => c.key === key);
    return (number === -1) ? '?' : `${number}`;
  },
  requestKey: key => {
    const value = fp.get(`citationUses[${key}]`)(get()) || 0;
    set(fp.set(`citationUses[${key}]`)(value + 1));
    return value;
  }
}));

export default useCitations;
