import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql, Link } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import useMutationObserver from "@rooks/use-mutation-observer"
import renderMathInElement from 'katex/dist/contrib/auto-render.js';

import katexConfig from '../../katex';
import Title from '../title';
import { PostLink, PostLinks } from '../post-links';

function useKaTeX(data) {
  // create a ref so that we can allow KaTeX to manipulate DOM
  const ref = React.useRef();

  // observe KaTeX mutations so that we can wrap display math in scroll box
  useMutationObserver(ref, () => {
    ref.current.querySelectorAll('span.katex-display').forEach(elm => {
      const parent = elm.parentNode;
      if (
        parent.tagName !== 'DIV' || !parent.classList.contains('katex-scroll')
      ) {
        parent.innerHTML = `<div class="katex-scroll">${parent.innerHTML}</div>`;
      }
    });
  });

  // parse the katex
  React.useEffect(() => {
    renderMathInElement(
      ref.current, 
      { 
        ...katexConfig,
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false},
        ]
      },
    );
  }, [data, ref]);

  // return the ref
  return ref;
}

export default function App({ data }) {
  // use ref with KaTeX render callback
  const ref = useKaTeX(data);
  
  // render the application
  return (
    <div ref={ ref }>
      <Helmet>
        <title>{ `${data.post.title} | rat.supply` }</title>
      </Helmet>
      <nav className="navbar is-success">
        <div class="navbar-brand">
          <Link to="/" className="navbar-item">rat.supply</Link>
        </div>
      </nav>
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
