import type { GatsbyConfig } from 'gatsby';
import { Options, defaultOptions } from './types';

// development flag for whether or not we show drafts
const DEVELOPMENT: boolean = (
  process && process.env && process.env.NODE_ENV === 'development'
)

export default function makeConfig(options: Partial<Options>): GatsbyConfig {
  // parse the options
  const { sourceDir } = defaultOptions(options);

  // source post files in the source directory
  return {
    plugins: [
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'presentations',
          path: sourceDir,
          ignore: (
            DEVELOPMENT 
            ? ["**/.*.mdx"] 
            : ["**/.*.mdx", "**/*.draft.*"]
          ),
        },
      }
    ],
  };
}
