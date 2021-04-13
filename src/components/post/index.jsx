import React from 'react';
import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import { content } from './index.module.scss';
import useKaTeX from '../../hooks/use-katex';
import useCitations from '../../hooks/use-citations';
import Title from '../title';
import Head from '../head';
import Navbar from '../navbar';
import { PostLink, PostLinks } from '../post-links';

export default function App({ data, ...props }) {
  // use ref with KaTeX render callback
  const ref = useKaTeX(data);

  // sort and parse the citations, if any
  const citations = data.post.citations.sort(citationSort);
  const set = useCitations(state => state.set);
  React.useEffect(() => set(citations), [set, citations]);

  // for all of the citation uses, we create links to reference
  const citationUses = useCitations(state => state.citationUses);
  console.log(citationUses);

  // render citations, if any
  const refsSection = (
    <div className="section" style={{ borderBottom: '1px solid var(--grey)' }}>
      <h1>References</h1>
        <div>{ 
          citations.map((citation, i) => 
            <div key={ citation.key } style={{ display: 'flex', margin: '1em 0' }}>
              <span style={{ marginRight: '0.5em' }}>{ `[${i}]` }</span>
              <Citation citation={ citation } uses={ citationUses[citation.key] } />
            </div>
          ) 
        }</div>
    </div>
  );
 
  // related posts block renders if we have any
  const relatedPosts = (
    <div className="section">
      <h1>Related posts</h1>
      <PostLinks>
        { 
          data.post.related.map(post => <PostLink key={ post.slug } { ...post } />) 
        }
      </PostLinks>
    </div>
  );
 
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
            <div className={ `${content} content` }>
              <div className="section" style={{ borderBottom: '1px solid var(--grey)' }}>
                <Title { ...data.post }/>
                <MDXRenderer>{data.post.body}</MDXRenderer>
              </div>
              { citations.length ? refsSection : null }
              { data.post.related.length ? relatedPosts : null }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function citationSort(a, b) {
  return (
    a.year && b.year
    ? a.year.localeCompare(b.year) || a.title.localeCompare(b.title)
    : (
      (a.year && !b.year) 
      ? -1
      : (b.year && !a.year ? 1 : a.title.localeCompare(b.title))
    )
  );
}

function parseAuthors(authors) {
  if (authors.length === 1) 
    return `${authors[0]}.`;
  if (authors.length === 2)
    return `${authors[0]} and ${authors[1]}.`;
  if (authors.length === 3)
    return `${authors[0]}, ${authors[1]}, and ${authors[2]}.`;
  else
    return `${authors[0]} et al.`
}

function Citation({ citation, uses, ...props }) {
  const links = React.useMemo(() => (
    uses
    ? (
      <span style={{ marginRight: '0.5em' }}>
        <i>
          (back to text:
          {
            Array(uses).fill().map((_, i) => (
              <a 
                href={ `#reference-${citation.key}-${i}` } 
                key={ i } 
                style={{ marginLeft: '0.25em' }}>
                <span role="img" aria-label="go up">👆</span>
              </a>
            ))
          }
          )
        </i>
      </span>
    ) : null),
    [citation.key, uses],
  );
  if (citation.entry_type === 'article') {
    return (
      <span id={ `references-${citation.key}` } { ...props }>
        <span style={{ marginRight: '0.5em' }}>{ parseAuthors(citation.authors) }</span>
        <span style={{ marginRight: '0.5em' }}>{ `${citation.title}.` }</span>
        <span style={{ marginRight: '0.5em' }}>
          <i>{ `${citation.journal}, ` }</i>
          { `${citation.volume}(${citation.number}):${citation.pages}, ${citation.month || ''} ${citation.year}.` }
        </span> 
        { links }
        <a href={ citation.url }>[external link]</a>
      </span>
    );
  }
  if (citation.entry_type === 'book') {
    return (
      <span id={ `references-${citation.key}` } { ...props }>
        <span style={{ marginRight: '0.5em' }}>{ parseAuthors(citation.authors) }</span>
        <span style={{ marginRight: '0.5em' }}><i>{ `${citation.title}.` }</i></span>
        <span style={{ marginRight: '0.5em' }}>
          { `${citation.publisher}, ${citation.year}.` }
        </span> 
        { links }
        <a href={ citation.url }>[external link]</a>
      </span>
    );
  }
  if (citation.entry_type === 'phdthesis') {
    return (
      <span id={ `references-${citation.key}` } { ...props }>
        <span style={{ marginRight: '0.5em' }}>{ parseAuthors(citation.authors) }</span>
        <span style={{ marginRight: '0.5em' }}><i>{ `${citation.title}.` }</i></span>
        <span style={{ marginRight: '0.5em' }}>
          { `PhD thesis, ${citation.school}, ${citation.month || ''} ${citation.year}.` }
        </span> 
        { links }
        <a href={ citation.url }>[external link]</a>
      </span>
    );
  }
  if (citation.entry_type === 'website') {
    return (
      <span id={ `references-${citation.key}` } { ...props }>
        <span style={{ marginRight: '0.5em' }}><i>{ `${citation.title}.` }</i></span>
        <span>Website. </span>
        { links }
        <a href={ citation.url }>{ decodeURI(citation.url) }</a>
      </span>
    );
  }
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
      citations {
        entry_type
        key
        month
        year
        title
        authors
        journal
        volume
        number
        pages
        school
        publisher
        url
        doi
      }
    }
  }
`
