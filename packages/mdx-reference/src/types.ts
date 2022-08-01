import type { PluginOptions } from 'gatsby';
import type { IMdxNode } from 'gatsby-plugin-mdx/dist/types';

export interface MdxReference {
  identifier: string,
  absolutePath: string,
}

export interface MdxNode extends IMdxNode { frontmatter?: object }

export interface Options extends PluginOptions {
  nodeName: string,
  identifierName: string,
  testNode: (node: any) => boolean,
  resourceKeyword: string,
}

export function defaultOptions(options: Partial<Options>): Options {
  const pluginOptions = Object.assign({}, options);
  if (!pluginOptions.nodeName) {
    pluginOptions.nodeName = 'MdxReference';
  }
  if (!pluginOptions.identifierName) {
    pluginOptions.identifierName = 'identifier';
  }
  if (!pluginOptions.testNode) {
    pluginOptions.testNode = _ => true;
  }
  if (!pluginOptions.resourceKeyword) {
    pluginOptions.resourceKeyword = 'mdx-reference'
  }
  return pluginOptions as Options;
}
