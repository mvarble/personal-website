import merge from 'deepmerge';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { IPluginRefOptions } from 'gatsby';

interface GatsbyPluginMdxOptions extends IPluginRefOptions {
  extensions: string[];
  gatsbyRemarkPlugins: any[];
  mdxOptions: Partial<MdxOptions>;
}

interface MdxOptions {
  remarkPlugins: any[];
  remarkRehypeOptions: object;
  rehypePlugins: any[];
  recmaPlugins: any[];
}

const SEED = {
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


export function extendOptions(
  options: Partial<GatsbyPluginMdxOptions> | undefined
): GatsbyPluginMdxOptions {
  return options ? merge(SEED, options) : merge({}, SEED);
};

export function extendMdxOptions(
  options: Partial<MdxOptions> | undefined
): MdxOptions {
  return options ? merge(SEED.mdxOptions, options) : merge({}, SEED.mdxOptions);
}
