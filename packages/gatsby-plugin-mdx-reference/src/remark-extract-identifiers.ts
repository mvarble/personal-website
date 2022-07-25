import type { VFile } from 'vfile';
import type { Node } from 'unist-util-visit';
import { Options, defaultOptions } from './types';

function remarkExtractIdentifiers(options: Partial<Options>) {
  const { resourceKeyword: keyword } = defaultOptions(options);
  async function transformer(markdownAST: Node, vfile: VFile) {
    // we add this data to the vfile
    vfile.data.identifiers = [];

    // fill list of reference imports
    const { visit } = await import('unist-util-visit');
    visit(markdownAST, node => {
      // only transform import statements
      if (node.type !== 'mdxjsEsm') return

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
          // @ts-ignore
          if (!vfile.data.identifiers.includes(identifier)) {
            // @ts-ignore
            vfile.data.identifiers.push(identifier);
          }
        }
      });
    });
  }
  return transformer;
}
export { remarkExtractIdentifiers };
