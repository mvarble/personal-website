import create from 'zustand';

const useCitations = create((set, get) => ({
  citations: [],
  set: citations => set(() => ({ citations })),
  getNumber: key => {
    const number = get().citations.findIndex(c => c.key === key);
    return (number === -1) ? '?' : `${number}`;
  },
}));

export default useCitations;
