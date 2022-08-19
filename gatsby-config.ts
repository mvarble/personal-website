import type { GatsbyConfig } from 'gatsby';
import { extendOptions } from '@mvarble/gatsby-plugin-mdx-config';
import remarkToDeckSchema from '@mvarble/gatsby-theme-presentations/dist/remark-to-deck-schema';

const config: GatsbyConfig = {
  plugins: [
    'gatsby-plugin-postcss',
    '@mvarble/gatsby-plugin-mdx-reference',
    '@mvarble/gatsby-theme-posts',
    '@mvarble/gatsby-theme-presentations',
    { 
      resolve: 'gatsby-plugin-mdx',
      options: extendOptions({
        gatsbyRemarkPlugins: [
          '@mvarble/gatsby-plugin-mdx-reference',
        ],
        mdxOptions: {
          remarkPlugins: [remarkToDeckSchema],
        },
      }),
    },
  ],
};

export default config;
