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
          require('map-citations'), // local submodule
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
