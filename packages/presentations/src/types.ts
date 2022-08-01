import type { Node, PluginOptions } from 'gatsby';

export interface Options extends PluginOptions {
  sourceDir: string,
  layoutPath: string,
}

export function defaultOptions(options: Partial<Options>): Options {
  const themeOptions = Object.assign({}, options);
  if (!themeOptions.sourceDir) {
    themeOptions.sourceDir = './content/presentations';
  }
  if (!themeOptions.layoutPath) {
    themeOptions.layoutPath = './src/layouts/deck.jsx';
  }
  return themeOptions as Options;
}

export interface MdxNode extends Node {
  frontmatter: Frontmatter
  body: string,
  parent: string,
};

interface Frontmatter {
  title: string,
  slug: string,
}
