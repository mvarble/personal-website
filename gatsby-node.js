// require fp for get method
const fp = require('lodash/fp');

// this creates our page schema
exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes(`
    type Page implements Node @infer {
      title: String!
      slug: String!
      body: String!
      tags: [String!]
      date: Date! @dateformat(formatString: "YYYY-MM-DD")
    }
  `);
};

// this creates our resolvers for the Page type
exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Page: {
      body: {
        resolve: async (source, args, context, info) => {
          const type = info.schema.getType('Mdx');
          const mdxNode = context.nodeModel.getNodeById({ id: source.parent });
          const resolver = type.getFields().body.resolve;
          const result = await resolver(
            mdxNode,
            args,
            context,
            { fieldName: 'body' },
          );
          return result;
        },
      },
    },
  });
}


// this is our mdx -> page transformer
exports.onCreateNode = ({
  node,
  actions,
  getNode,
  createNodeId,
  createContentDigest,
}) => {
  // only create pages from Mdx nodes
  if (node.internal.type !== 'Mdx') return;

  // parse frontmatter
  const slug = fp.get('frontmatter.slug')(node);
  const date = fp.get('frontmatter.date')(node);
  const title = fp.get('frontmatter.title')(node);
  if (!slug || !date || !title) {
    console.warn(`Missing correct frontmatter of ${node.id}`);
    return;
  }
  const tagsString = fp.get('frontmatter.tags')(node) || '';
  const tags = tagsString.split(', ').filter(s => s);

  // create the id for the node
  const id = createNodeId(`${node.id} >>> Page`);

  // create the node
  actions.createNode({
    // fields inherited from parent's frontmatter
    title,
    slug,
    date,
    tags,
    // required fields for Node interface
    id,
    parent: node.id,
    children: [],
    internal: {
      type: 'Page',
      contentDigest: createContentDigest(node.rawBody),
      content: node.rawBody,
      description: 'Page',
    },
  });

  // create the parent/child edge
  actions.createParentChildLink({ 
    parent: getNode(node.parent), 
    child: getNode(id),
  });
}

// this creates the routes of our website
exports.createPages = async ({ graphql, actions, reporter }) => {
  // our pages will come from all Page nodes
  const result = await graphql(`
    {
      allPage(sort: {fields: date}) {
        edges {
          node {
            title
            slug
            date
          }
        }
      }
    }
  `);

  // report errors
  if (result.errors) {
    reporter.panic(result.errors)
    return;
  }

  // create a page for each node
  fp.get('data.allPage.edges')(result)
    .forEach(({ node }) => {
      actions.createPage({
        path: node.slug,
        component: `${__dirname}/src/components/app/index.jsx`,
        context: { slug: node.slug },
      });
    });
}

