// development flag for whether or not we show drafts
const DEVELOPMENT = (
  process && process.env && process.env.NODE_ENV === 'development'
);

// filesystem depends on development
const filesystem = (() => {
  const posts = {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'posts',
      path: 'posts',
    },
  }
  const drafts = {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'drafts',
      path: 'drafts',
    },
  };
  return DEVELOPMENT ? [posts, drafts] : [posts];
})();

// add the transformer that will parse citations
const visit = require('unist-util-visit');
const mapCitations = () => tree => {
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

/*
 * configure the autolinks
 */
module.exports = {
  plugins: [
    ...filesystem,
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        gatsbyRemarkPlugins: [
          'gatsby-remark-embed-snippet',
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              aliases: { jl: 'julia' },
            },
          },
        ],
        remarkPlugins: [
          require('remark-emoji'),
          [require('remark-disable-tokenizers'), { block: ['indentedCode'] }],
        ],
        rehypePlugins: [
          mapCitations, 
          require('rehype-slug'),
          [
            require('rehype-autolink-headings'), 
            { 
              content: {
                type: 'element',
                tagName: 'i',
                properties: { className: ['fas', 'fa-link', 'fa-xs'] },
                children: [],
              },
              properties: {},
            },
          ],
        ],
      },
      extensions: ['.mdx'],
    },
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        useResolveUrlLoader: true,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'assets',
        path: 'assets',
      },
    },
    'gatsby-transformer-bibtex',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-catch-links',
  ],
};
