import React from 'react';
import fp from 'lodash/fp';
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import renderMathInElement from 'katex/dist/contrib/auto-render.js';
import katexConfig from '../../katex';

function useKaTeX(data) {
  const ref = React.useRef();
  React.useEffect(() => {
    renderMathInElement(
      ref.current,
      { 
        ...katexConfig,
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false},
        ],
      }
    );
  }, [ref, data]);
  return ref;
}

export default function App({ data }) {
  // use ref with KaTeX render callback
  const ref = useKaTeX(data);
  
  // render the application
  return (
    <div ref={ ref }>
      <Helmet>
        <title>{ `${fp.get('page.title')(data)} | rat.supply` }</title>
      </Helmet>
      <div className="is-marginless is-paddingless">
        <div className="section">
          <div className="columns">
            <div className="column is-4"></div>
            <div className="column is-8">
              <div className="content">
                <MDXRenderer>{ fp.get('page.body')(data) }</MDXRenderer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const query = graphql`
  query PageQuery($slug: String!) {
    page(slug: { eq: $slug }) {
      title
      slug
      date
      tags
      body
    }
  }
`
