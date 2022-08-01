# gatsby-plugin-mdx-reference

This plugin will identify `Mdx` nodes (sourced from `gatsby-plugin-mdx`) with identifier strings in their frontmatter.
An `MdxReference` node makes this identification with an `identifier` field from the `Mdx` frontmatter and an `absolutePath` field derived from the `File` node that is the parent of the `Mdx` node.
In addition to creating nodes, this plugin also transforms `Mdx` content by implementing a resolver which allows one to import mdx content via the identifier.
The `MdxReference` node will track all `Mdx` nodes which import using this resolver; this helps for site metadata.
Take the following files as example.


*Mdx with an identifier*

```mdx
---
identifier: why-you-should-like-rats
---

- They are cute.
- They are good boys.
- They love each other.
```

*Mdx file which makes reference*

```mdx
---
title: MDX file which makes reference
slug: /referer
---

import GoodReasons from 'mdx-reference:why-you-should-like-rats';

# This page contains very a useful fact

People should like rats for the following reasons.

<GoodReasons />
```

*Mdx file which mentions references*

```mdx
---
title: MDX file which mentions references
slug: /mentions-references
---

import { Link, graphql } from 'gatsby';

export const query = graphql`
  query References {
    mdxReference(identifier: {eq: "why-you-should-like-rats"}) {
      children: {
        ...on Mdx {
          title,
          slug,
        }
      }
    }
  }
`

The following pages reference why you should like rats.

<ul>
  { 
    data.mdxReference.children.map(({ title, slug }) => 
      <Link to={ slug }>{ title }</Link>
    )
  }
</ul>
```

## How the plugin creates `MdxReference` nodes

The Gatsby `onCreateNode` hook creates a node for each `Mdx` node that has an `identifier` field in the frontmatter.
It will also track all imports of the form `mdx-reference:...`.

## How `mdx-reference:` imports work

A `GatsbyRemarkPlugin` is implemented to transform any `mdx-reference:...` imports to the respective absolute path.

## How to configure

You need to add the plugin to both your GatsbyConfig and as a GatsbyRemarkPlugin on your `gatsby-plugin-mdx` configuration.
The following example includes all possible configuration properties.

```js
module.exports = {
  // other gatsby-config.js stuff...
  {
    resolve: '@mvarble/gatsby-plugin-mdx-reference'
    options: {
      // whatever you want your node names to be
      nodeName: 'MdxReference'
      // whatever you want your frontmatter field to be which identifies the node
      identifierName: 'identifier',
      // a custom function `(Mdx node) => boolean` which determines node production
      testNode: node => true,
    },
  },
  {
    resolve: 'gatsby-plugin-mdx',
    options: {
      gatsbyRemarkPlugins: {
        {
          resolve: '@mvarble/gatsby-plugin-mdx-reference',
          options: {
            // whatever `keyword` you want in your custom import statements
            resourceKeyword: 'mdx-reference'
          },
        },
      },
    }
  },
};
```

