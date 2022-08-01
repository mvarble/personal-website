import { resolve } from 'node:path';
import type { GatsbyNode, Node } from 'gatsby';
import type { FileSystemNode } from 'gatsby-source-filesystem';
import { Options, defaultOptions, MdxNode } from './types';

export const createPages: GatsbyNode["createPages"] = async (
  { graphql, actions: { createPage } },
  options: Partial<Options>,
) => {
  // get the path to the layout component
  const { layoutPath } = defaultOptions(options);

  // grab all presentations
  const { data } = await graphql(
    `{
      allPresentation {
        nodes {
          parent {
            parent {
              ... on File {
                absolutePath
              }
            }
          }
          slug
        }
      }
    }`
  )

  // for each presentation, build a page on the site
  // @ts-ignore
  data.allPresentation.nodes.forEach(node => {
    const mdxPath = node.parent.parent.absolutePath;
    const query = `?__contentFilePath=${mdxPath}`;
    const componentPath = layoutPath + query;
    createPage({
      path: `/presentations${node.slug}`,
      component: resolve(componentPath),
    });
  });
}
export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = async ({ 
  actions, 
  schema 
}) => {
  const { createTypes } = actions;
  const typeDefs = [
    schema.buildObjectType({
      name: 'Presentation',
      fields: {
        title: 'String!',
        slug: 'String!',
      },
      interfaces: ['Node'],
    }),
  ];
  createTypes(typeDefs);
};

export const unstable_shouldOnCreateNode: GatsbyNode["unstable_shouldOnCreateNode"] = 
  ({ node }: { node: Node }) => (
    node.internal.type === 'Mdx'
    && typeof node.parent === 'string'
    && typeof node.frontmatter === 'object'
    && node.frontmatter !== null
    && typeof node.frontmatter['title'] === 'string'
    && typeof node.frontmatter['slug'] === 'string'
  );

export const onCreateNode: GatsbyNode<MdxNode>["onCreateNode"] = async ({
  node,
  actions: { createNode, createParentChildLink },
  createNodeId,
  createContentDigest,
  getNode,
}, options: Partial<Options>) => {
  // parse the options
  const { sourceDir } = defaultOptions(options);

  // Filter out any nodes which were not sourced by this theme
  const fileNode = getNode(node.parent) as FileSystemNode;
  const absolutePath = fileNode.absolutePath;
  if (!absolutePath.includes(resolve(process.cwd(), sourceDir))) return;

  // create a `Presentation` node for each `Mdx` node that was sourced from this theme
  const { title, slug } = node.frontmatter;
  const presContent = JSON.stringify({ title, slug });
  const presNode = {
    id: createNodeId(`${node.id} >>> Presentation`),
    children: [],
    parent: node.id,
    internal: {
      content: presContent,
      type: 'Presentation',
      contentDigest: createContentDigest(presContent),
    },
    title,
    slug,
  };
  createNode(presNode);
  createParentChildLink({ parent: node, child: presNode });
};
