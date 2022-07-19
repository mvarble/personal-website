# gatsby-plugin-mdx-reference

This plugin will produce from each `Mdx` node (sourced from `gatsby-plugin-mdx`) a collection `MdxReferent` nodes that appear in the body.
The `MdxReferent` type is the same as the `Mdx` type, but the parent will be the relevant `Mdx` node (as opposed to the `File` node).
This plugin was designed with the intent to be able to refer to specific content within an mdx body throughout the Gatsby application.
Take the following files as example.

```mdx
---
title: MDX file which contains `MdxReferent` components to which we may refer.
slug: /referent
---

# This page contains very a useful fact

People should like rats for the following reasons.

<MdxReferent identifier="why-you-should-like-rats">
  - They are cute.
  - They are good boys.
  - They love each other.
</MdxReferent>
```

```mdx
---
title: MDX file which makes some references.
slug: /referer
---

import MdxReference from '@mvarble/gatsby-plugin-mdx-chunk';

# This page returns to an earlier discussion

Recall in [the other page](/referent), how I discussed why people should like rats.

<MdxReference identifier="why-you-should-like-rats" />

Aren't these very valid reasons?
```

The second file body will contain the list produced in that of the first file.
This way, we do not need to keep the list consistent between the two files.
Note that there are two custom components which show up in the files.

- `MdxReferent`: This will be rendered to a React fragment, and it is used by our plugin to create the `MdxReferent` nodes.
   We do not need to import it, because it is simply a markup for our internal custom mdx processor.
   **Note.** It it must have an `identifier` prop, so that we can later reference it.
- `MdxReference`: This component grabs the appropriate GraphQL payload data from the mdx context to resolve the content.
   If it doesn't find the data, it will render an unobtrusive error message and log a warning to the console.

## How it creates nodes

An `onCreateNode` hook is established by this plugin, which calls `compileMDXWithCustomOptions` (from the `gatsby-plugin-mdx` API) on each `Mdx` node.
The mdx compiler is configured with a remark plugin which extracts all tags which pass some sort of test function.

## How `MdxChunkReference` works

This plugin uses the `createResolvers` Gatsby node API to add resolvers to `Mdx` nodes, which resolve all `identifier` keys that appear in the `MdxChunkReference` components in the mdx body.
From here, the template associated to an `Mdx` node containing `MdxChunkReference` components may query the appropriate `MdxChunkReference` nodes.

## Configuring

Our options are as follows.

|keyword|description|
|-------|-----------|
|`mdxReferentName`|The name of the tag that our remark extraction plugin looks for. (Default: `'MdxReferent'`)|
|`resolverVariable`|The variable our GraphQL resolver creates to list reference identifiers within a given mdx file.|
