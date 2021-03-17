const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const decorations = letters.reduce(
  (acc, l) => ({ 
    ...acc,
    [`\\cal${l}`]: `\\mathcal{${l}}`,
    [`\\rm${l}`]: `\\mathrm{${l}}`,
    [`\\bb${l}`]: `\\mathbb{${l}}`,
    '\\T': '\\top',
  }),
  {}
);
module.exports = {
  macros: {
    ...decorations,
    '\\var': '\\operatorname{var}',
  },
};
