import type { Reporter } from 'gatsby';
import type { Node } from 'unist-util-visit';
import { Options } from './types';


export default async (
  { markdownAST, reporter }: {
    markdownAST: Node,
    getNodesByType: (kind: string) => Array<any>,
    reporter: Reporter,
  },
  {}: Partial<Options>,
) => {
  reporter.log(`markdownAST: \n${JSON.stringify(markdownAST)}`);
};
