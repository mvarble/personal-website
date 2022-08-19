import { lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GatsbyNode, Node } from 'gatsby';
import type { FileSystemNode } from 'gatsby-source-filesystem';

import { Options, defaultOptions, MdxNode } from './types';

export const createPages: GatsbyNode["createPages"] = async (
  { graphql, actions: { createPage }, reporter },
  options: Partial<Options>,
) => {
  // get the path to the layout component
  const { layoutPath } = defaultOptions(options);

  // if the layout path does not exist, we throw an error
  try {
    lstatSync(resolve(layoutPath));
  } catch (e) {
    if (e.code === 'ENOENT') {
      reporter.error('layout does not resolve', e, '@mvarble/gatsby-theme-posts');
    } else {
      throw e;
    }
    return;
  }

  // grab all posts
  const { data } = await graphql(
    `{
      allPost {
        nodes {
          parent {
            ... on Mdx {
              internal {
                contentFilePath
              }
            }
          }
          slug
          id
        }
      }
    }`
  )
  interface NodeData {
    parent: {
      internal: {
        contentFilePath: string;
      };
    };
    slug: string;
    id: string;
  };

  // for each post, build a page on the site
  // @ts-ignore
  data.allPost.nodes.forEach((node: NodeData) => {
    const mdxPath = node.parent.internal.contentFilePath;
    const query = `?__contentFilePath=${mdxPath}`;
    const componentPath = layoutPath + query;
    createPage({
      path: `/posts${node.slug}`,
      component: resolve(componentPath),
      context: {
        id: node.id,
      }
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
      name: 'Post',
      fields: {
        title: 'String!',
        slug: 'String!',
        date: 'Date!',
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

  /**
   * create a `Post` node for each `Mdx` node that was sourced from this theme
   */

  // parse the frontmatter
  const { title, slug, date } = node.frontmatter;

  // create the Gatsby node
  const postContent = JSON.stringify({ title, slug, date });
  const postNode = {
    id: createNodeId(`${node.id} >>> Post`),
    children: [],
    parent: node.id,
    internal: {
      content: postContent,
      type: 'Post',
      contentDigest: createContentDigest(postContent),
    },
    title,
    slug,
    date,
  };
  createNode(postNode);
  createParentChildLink({ parent: node, child: postNode });
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions: { setWebpackConfig },
}) => {
  setWebpackConfig({
    resolve: {
      alias: {
        '@posts': '@mvarble/gatsby-theme-posts/dist/index',
      },
    },
  });
};
