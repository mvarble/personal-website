import { PluginOptions, Node } from 'gatsby';

export interface Options extends PluginOptions {
  layoutPath: string;
  sourceDir: string;
}

export function defaultOptions(partialOptions: Partial<Options>) {
  const options = Object.assign({}, partialOptions);
  if (!options.layoutPath) {
    options.layoutPath = './src/layouts/post.tsx';
  }
  if (!options.sourceDir) {
    options.sourceDir = './content/posts';
  }
  return options as Options;
}

export interface MdxNode extends Node {
  frontmatter: Frontmatter
  body: string,
  parent: string,
};

interface Frontmatter {
  title: string;
  slug: string;
  date: unknown;
}
