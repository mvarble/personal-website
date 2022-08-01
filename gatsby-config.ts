import type { GatsbyConfig } from 'gatsby';
import extendOptions from '@mvarble/gatsby-plugin-mdx-config';

const config: GatsbyConfig = {
  plugins: [
    '@mvarble/gatsby-plugin-mdx-reference',
    '@mvarble/gatsby-theme-presentations',
    { 
      resolve: 'gatsby-plugin-mdx',
      options: extendOptions({
        gatsbyRemarkPlugins: [
          '@mvarble/gatsby-plugin-mdx-reference',
          '@mvarble/gatsby-theme-presentations',
        ],
      }),
    },
  ],
};

export default config;
