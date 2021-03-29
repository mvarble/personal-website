/*
 * configure the autolinks
 */
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: 'posts',
      },
    },
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
