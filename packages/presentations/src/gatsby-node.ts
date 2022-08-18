import { lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GatsbyNode, Node } from 'gatsby';
import type { FileSystemNode } from 'gatsby-source-filesystem';
import { extendMdxOptions } from '@mvarble/gatsby-plugin-mdx-config';

import { Options, defaultOptions, MdxNode } from './types';
import { isNonnegativeInteger } from './utils';
import remarkToDeckSchema from './remark-to-deck-schema';

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
      reporter.error('layout does not resolve', e, '@mvarble/gatsby-theme-presentations');
    } else {
      throw e;
    }
    return;
  }

  // grab all presentations
  const { data } = await graphql(
    `{
      allPresentation {
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

  // for each presentation, build a page on the site
  // @ts-ignore
  data.allPresentation.nodes.forEach((node: NodeData) => {
    const mdxPath = node.parent.internal.contentFilePath;
    const query = `?__contentFilePath=${mdxPath}`;
    const componentPath = layoutPath + query;
    createPage({
      path: `/presentations${node.slug}`,
      matchPath: `/presentations${node.slug}/*`,
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
      name: 'Presentation',
      fields: {
        title: 'String!',
        slug: 'String!',
        date: 'Date!',
        width: 'Int!',
        height: 'Int!',
        fragmentsBySlide: '[Int!]!',
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
   * create a `Presentation` node for each `Mdx` node that was sourced from this theme
   */

  // parse the frontmatter
  const { 
    title, 
    slug, 
    date,
    width: maybeWidth, 
    height: maybeHeight,
  } = node.frontmatter;

  // revert to default dimensions if not provided
  const width = (
    typeof maybeWidth === 'number' && isNonnegativeInteger(maybeWidth)
    ? maybeWidth
    : 960
  );
  const height = (
    typeof maybeHeight === 'number' && isNonnegativeInteger(maybeHeight)
    ? maybeHeight
    : 700
  );

  // perform a compile to grab the fragment indices
  const { compile } = await import('@mdx-js/mdx');
  const remarkFrontmatter = (await import('remark-frontmatter')).default;
  const vfile = await compile(node.body, extendMdxOptions({
    remarkPlugins: [
      remarkFrontmatter,
      remarkToDeckSchema,
    ],
  }));
  // @ts-ignore
  const fragmentsBySlide = vfile.data.presentation.fragmentsBySlide;

  // create the Gatsby node
  const presContent = JSON.stringify({ 
    title, 
    slug, 
    date,
    width, 
    height, 
    fragmentsBySlide,
  });
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
    date,
    width,
    height,
    fragmentsBySlide,
  };
  createNode(presNode);
  createParentChildLink({ parent: node, child: presNode });
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions: { setWebpackConfig },
}) => {
  setWebpackConfig({
    resolve: {
      alias: {
        '@presentations': '@mvarble/gatsby-theme-presentations/dist/index',
      },
    },
  });
};
