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

const ALL_LETTERS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 
  'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

const DECORATOR_MACROS = ALL_LETTERS.reduce((obj, l) => {
  const L = l.toUpperCase();
  return {
    ...obj,
    [`\\rm${l}`]: `\\mathrm{${l}}`,
    [`\\rm${L}`]: `\\mathrm{${L}}`,
    [`\\cal${L}`]: `\\mathcal{${L}}`,
    [`\\scr${L}`]: `\\mathscr{${L}}`,
    [`\\bb${L}`]: `\\mathbb{${L}}`,
  };
}, {});

const SEED = {
  plugins: [],
  extensions: ['.mdx'],
  gatsbyRemarkPlugins: [],
  mdxOptions: {
    remarkPlugins: [remarkMath],
    remarkRehypeOptions: {},
    rehypePlugins: [
      [
        rehypeKatex, 
        {
          macros: {
            ...DECORATOR_MACROS,
            ['\\Prb']: '\\rmP',
            ['\\Qrb']: '\\rmQ',
            ['\\Exp']: '\\rmE',
            ['\\tr']: '\\operatorname{tr}',
            ['\\Der']: '\\rmD',
            ['\\Hess']: '\\rmD^2',
            ['\\defeq']: ':=',
          },
        },
      ],
    ],
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
