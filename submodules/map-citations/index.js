const visit = require('unist-util-visit');

module.exports = () => tree => {
  const citationUses = {};
  visit(tree, 'jsx', node => {
    if (typeof node.value === 'string' && node.value.match('<Cite')) {
      const bibKey = node.value.match(/(?<=bibKey=")[aA-zZ0-9\-]+(?=")/g);
      if (bibKey) {
        const id = (citationUses[bibKey] || 0) + 1;
        citationUses[bibKey] = id;
        node.value = node.value.replace('<Cite', `<Cite id="${id}"`);
      }
    }
  });
}
