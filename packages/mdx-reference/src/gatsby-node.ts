import type { GatsbyNode, Node, NodeInput } from 'gatsby';
import type { FileSystemNode } from 'gatsby-source-filesystem';
import { Options, defaultOptions, MdxReference, MdxNode } from './types';
import { remarkExtractIdentifiers } from './remark-extract-identifiers';

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = async (
  { actions, schema }, 
  pluginOptions: Partial<Options>
) => {
  const { nodeName } = defaultOptions(pluginOptions);
  const { createTypes } = actions;
  const typeDefs = [
    schema.buildObjectType({
      name: nodeName,
      fields: {
        identifier: 'String!',
      },
      interfaces: ['Node'],
    }),
  ];
  createTypes(typeDefs);
};

export const unstable_shouldOnCreateNode: GatsbyNode["unstable_shouldOnCreateNode"] = 
  ({ node }: { node: Node }) => (node.internal.type === 'Mdx');

export const onCreateNode: GatsbyNode<MdxNode>["onCreateNode"] = async (
  {
    node,
    getNode,
    getNodesByType,
    cache,
    createContentDigest,
    actions: { createNode, createParentChildLink },
    createNodeId,
  }, 
  pluginOptions: Partial<Options>,
) => {
  // parse the options
  const { 
    nodeName,
    identifierName,
    testNode,
  } = defaultOptions(pluginOptions);

  // all `Mdx` nodes have a `File` node as a parent with `absolutePath` field
  const fileNode = getNode(node.parent as string) as FileSystemNode;
  const absolutePath = fileNode.absolutePath;
  const identifier = node.frontmatter && node.frontmatter[identifierName];

  /**
   * 1: Create `MdxReference` node: If this `Mdx` node has an `identifier` frontmatter, then we 
   *    create a derived `MdxReference` node.
   */
  // get the identifier from the mdx
  const id = createNodeId(`${node.id} >>> ${nodeName}`);
  if (identifier && testNode(node)) {
    // create the `MdxReference` node
    const content = JSON.stringify({ identifier, absolutePath });
    const refNode: NodeInput = {
      id,
      children: [],
      parent: node.id,
      internal: {
        content: content,
        type: nodeName,
        contentDigest: createContentDigest(content),
      },
      identifier,
      absolutePath,
    };
    createNode(refNode);
    createParentChildLink({ parent: node, child: refNode });
  }

  /**
   * 2: Track dependencies: obtain all references that appear in the body of this particular `Mdx`
   *    node.
   */
  const { createProcessor } = await import('@mdx-js/mdx');
  const processor = createProcessor({
    remarkPlugins: [
      [remarkExtractIdentifiers, pluginOptions]
    ],
  });
  const vfile = await processor.process(node.body as string);
  let identifiers = vfile.data.identifiers as Array<string>;

  /**
   * 3: Resolve dependencies: for each identifier that appears in a reference in the body of this 
   *    particular `Mdx` node (from step 2), create a ParentChildLink with parent being the 
   *    `MdxReference` node bearing such identifier.
   */
  const referenceNodes = getNodesByType(nodeName) as Array<MdxReference & Node>;
  referenceNodes.forEach(referenceNode => {
    let index = identifiers.findIndex(i => i === referenceNode.identifier);
    if (index > -1) {
      identifiers = [
        ...identifiers.slice(0, index),
        ...identifiers.slice(index+1),
      ];
      createParentChildLink({ parent: referenceNode, child: node });
    }
  });

  /**
   * 4: Resolve dependencies: repeat step 3 for cached dependencies (populated in step 5).
   */
  let pending = await cache.get('@mvarble/gatsby-plugin-mdx-reference');
  pending = pending || {};
  referenceNodes.forEach(referenceNode => {
    if (Array.isArray(pending[referenceNode.identifier])) {
      pending[referenceNode.identifier].forEach(mdxNode => {
        createParentChildLink({
          parent: referenceNode,
          child: mdxNode,
        });
      });
      delete pending[referenceNode.identifier];
    }
  });

  /**
   * 5: Cache dependencies: for those identifiers that don't have an associated `MdxReference` node,
   *    cache the identifier and this `Mdx` node.
   */
  identifiers.forEach(identifier => {
    pending = {
      ...pending,
      [identifier]: [
        ...(pending[identifier] || []),
        node,
      ]
    };
  });
  await cache.set('@mvarble/gatsby-plugin-mdx-reference', pending);
}
