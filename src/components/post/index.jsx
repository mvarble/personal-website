import React from 'react';
import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import useKaTeX from '../../hooks/use-katex';
import Title from '../title';
import Head from '../head';
import Navbar from '../navbar';
import { PostLink, PostLinks } from '../post-links';

export default function App({ data }) {
  // use ref with KaTeX render callback
  const ref = useKaTeX(data);
  
  // render the application
  return (
    <div ref={ ref }>
      <Head title={ data.post.title } />
      <Navbar />
      <div className="is-marginless is-paddingless">
        <div className="columns">
          <div 
            className="column is-two-thirds-widescreen is-full-desktop" 
            style={{ margin: '0 auto' }}>
            <div className="content">
              <div className="section" style={{ borderBottom: '1px solid var(--grey)' }}>
                <Title { ...data.post }/>
                <MDXRenderer>{data.post.body}</MDXRenderer>
              </div>
              <div className="section">
                <h1>Related posts</h1>
                <PostLinks>
                  { 
                    data.post.related.map(post => <PostLink key={ post.slug } { ...post } />) 
                  }
                </PostLinks>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const query = graphql`
  query PostQuery($slug: String!) {
    post(slug: { eq: $slug }) {
      title
      slug
      date
      tags
      body
      related {
        title
        slug
        tags
        date
      }
    }
  }
`
