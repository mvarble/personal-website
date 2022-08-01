import merge from 'deepmerge';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { IPluginRefOptions } from 'gatsby';

interface GatsbyPluginMdxOptions extends IPluginRefOptions {
  extensions: string[];
  gatsbyRemarkPlugins: any[];
  mdxOptions: {
    remarkPlugins: any[];
    remarkRehypeOptions: object;
    rehypePlugins: any[];
    recmaPlugins: any[];
  };
}

export default function extendOptions(
  options: Partial<GatsbyPluginMdxOptions> | undefined
): GatsbyPluginMdxOptions {
  const seed = {
    plugins: [],
    extensions: ['.mdx'],
    gatsbyRemarkPlugins: [],
    mdxOptions: {
      remarkPlugins: [remarkMath],
      remarkRehypeOptions: {},
      rehypePlugins: [rehypeKatex],
      recmaPlugins: [],
    },
  };
  return options ? merge(seed, options) : seed;
};
