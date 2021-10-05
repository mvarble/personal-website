// require fp for get method
const fp = require('lodash/fp');
const graphql = require('gatsby').graphql;

// this deals with the @react-three/drei Html component and allows .gltf imports
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  const config = {
    module: {
      rules: [
        { test: /\.gltf$/, use: 'file-loader' },
        { test: /\.txt$/, use: 'raw-loader' },
      ],
    },
  };
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig(fp.update('module.rules')(a => [
      ...a,
      { test: /@react-three\/drei/, use: loaders.null() },
    ])(config));
  } else {
    actions.setWebpackConfig(config);
  }
};

// this creates our page schema
exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes(`
    type Post implements Node {
      title: String!
      slug: String!
      body: String!
      tags: [String!]!
      date: Date! @dateformat(formatString: "YYYY-MM-DD")
      related: [Post!]
      citations: [Reference!]
    }
  `);
};

function passthrough(fieldName) {
  return async (source, args, context, info) => {
    const type = info.schema.getType('Mdx');
    const mdxNode = context.nodeModel.getNodeById({ id: source.parent });
    const resolver = type.getFields().body.resolve;
    const result = await resolver(
      mdxNode,
      args,
      context,
      { fieldName },
    );
    return result;
  };
}

// this creates our resolvers for the Post type
exports.createResolvers = ({ createResolvers, ...rest }) => {
  createResolvers({
    Post: {
      body: {
        resolve: passthrough('body'),
      },
      related: {
        resolve: (source, args, context, info) => {
          const { related } = JSON.parse(source.internal.content)
          return context.nodeModel.getAllNodes({ type: 'Post' })
            .filter(({ slug }) => related.includes(slug));
        },
      },
      citations: {
        resolve: async (source, args, context, info) => {
          const { references } = JSON.parse(source.internal.content);
          const refs = await context.nodeModel.runQuery({ 
            query: { filter: { key: { in: references } } },
            type: "Reference",
          })
          return refs || []
        },
      }
    },
  });
}


// this is our Mdx -> Post transformer
exports.onCreateNode = ({
  node,
  actions,
  getNode,
  getNodesByType,
  createNodeId,
  createContentDigest,
}, a, b, c, d) => {
  // only create Post nodes from Mdx nodes
  if (node.internal.type !== 'Mdx') return;

  // parse frontmatter
  const slug = fp.get('frontmatter.slug')(node);
  const date = fp.get('frontmatter.date')(node);
  const title = fp.get('frontmatter.title')(node);
  if (!slug || !date || !title) {
    console.warn(`Missing correct frontmatter of ${node.id}`);
    return;
  }
  const tags = fp.get('frontmatter.tags')(node) || [];
  const related = fp.get('frontmatter.related')(node) || [];
  const references = fp.get('frontmatter.references')(node) || [];

  // create the id for the node
  const id = createNodeId(`${node.id} >>> Post`);

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
      type: 'Post',
      contentDigest: createContentDigest(node.rawBody),
      content: JSON.stringify({ related, references }),
      description: 'Post',
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
  // our pages will come from Post nodes
  const result = await graphql(`
    {
      allPost(sort: { fields: date }) {
        nodes {
          title
          slug
          date
        }
      }
    }
  `);

  // report errors
  if (result.errors) {
    reporter.panic(result.errors)
    return;
  }

  // create a page for each Post node
  fp.get('data.allPost.nodes')(result)
    .forEach(({ slug }) => {
      actions.createPage({
        path: slug,
        component: `${__dirname}/src/components/post/index.jsx`,
        context: { slug },
      });
    });
}
