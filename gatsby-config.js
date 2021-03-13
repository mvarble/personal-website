module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: 'pages',
      },
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        remarkPlugins: [
          require('remark-emoji'),
          [require('remark-disable-tokenizers'), { block: ['indentedCode'] }],
        ],
        defaultLayouts: {
          default: require.resolve('./src/components/default-layout.jsx'),
        },
      },
      extensions: ['.mdx'],
    },
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        useResolveUrlLoader: true,
      },
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-catch-links',
  ],
};
