import type { Reporter } from 'gatsby';
import type { Node } from 'unist-util-visit';
import { 
  MdxReference, 
  Options, 
  defaultOptions,
} from './types';

interface PluginPayload {
  markdownAST: Node,
  getNodesByType: (kind: string) => Array<MdxReference>,
  reporter: Reporter,
};

export default async (
  payload: PluginPayload, 
  pluginOptions: Partial<Options>,
) => {
  // parse the options
  const { 
    resourceKeyword: keyword,
  } = defaultOptions(pluginOptions);

  // grab the relevant items from the payload
  const { markdownAST, getNodesByType, reporter } = payload;

  // create a map of the references
  const references = getNodesByType('MdxReference')
    .reduce((obj, { identifier, absolutePath }) => ({
      ...obj,
      [identifier]: absolutePath,
    }), {});

  // convert reference imports to absolute paths
  const { visit } = await import('unist-util-visit');
  visit(markdownAST, node => {
    // only transform import statements
    if (node.type !== 'mdxjsEsm') return

    // easier to transform the estree and build the mdast node from there
    // gatsby-plugin-mdx ensures `node.data.estree` exists and is as we like.
    // @ts-ignore
    node.data.estree.body.forEach(bodyNode => {
      // only convert import statements
      if (bodyNode.type !== 'ImportDeclaration') return;

      // convert reference imports
      const source = bodyNode.source;
      if (
        source.type === 'Literal'
        // @ts-ignore
        && source.value.slice(0, keyword.length + 1) === `${keyword}:`
      ) {
        // @ts-ignore
        const identifier = source.value.slice(keyword.length + 1);
        const absolutePath = references[identifier];
        if (absolutePath) {
          source.value = absolutePath;
          source.raw = `"${absolutePath}"`;
          // @ts-ignore
          node.value = 
            // @ts-ignore
            node.value.slice(0, source.start) 
            + source.raw 
            // @ts-ignore
            + node.value.slice(source.end);
        } else {
          reporter.panic(
            'reference-resolver: ' +
            `Cannot resolve identifier ${identifier} to reference`
          );
        }
      }
    })
  });

  return markdownAST;
};
