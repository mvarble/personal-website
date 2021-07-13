import React from 'react';
import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import shallow from 'zustand/shallow';

import { content, sideTree } from './index.module.scss';
import useKaTeX from '../../hooks/use-katex';
import useUI from '../../hooks/use-ui';
import Title from '../title';
import Head from '../head';
import Navbar from '../navbar';
import Forest from '../forest';
import { PostLink, PostLinks } from '../post-links';
import useCitations from '../../hooks/use-citations';

export default function App({ data, ...props }) {
  // use ref with KaTeX render callback
  const ref = useKaTeX(data);

  // sort and parse the citations, if any
  const citations = data.post.citations.sort(citationSort);

  // get the UI state to position forests
  const [navbarHidden, margin] = useUI(
    state => [state.navbarHidden, state.margin],
    shallow
  );

  // bind scroll effects to highlight appropriate part of page
  const [heights, setHeights] = React.useState(undefined);
  const [current, setCurrent] = React.useState(null);
  React.useEffect(() => {
    if (!document || !window) return;
    const scrollY = document.documentElement.scrollTop;
    const query = document.querySelectorAll('a[href] > i.fas.fa-link.fa-xs'); // hacky way to grab links
    const elms = [ ...query ];
    setHeights(elms.map(elm => [
      elm.parentNode.attributes.href.value,
      elm.parentNode.getBoundingClientRect().y + scrollY
    ]));
  }, [setHeights, setCurrent]);
  React.useEffect(() => {
    if (!heights || !document) return;
    const callback = () => {
      const scroll = document.documentElement.scrollTop;
      let index = heights.findIndex(a => a[1] > scroll);
      index = (index === -1 ? heights.length : index) - 1;
      setCurrent(index > -1 ? heights[index][0] : null);
    };
    document.addEventListener('scroll', callback);
    return () => document.removeEventListener('scroll', callback);
  }, [heights, setCurrent]);

  // propogate the citation state for numbering and obtain the uses
  const [setNumbers, uses] = useCitations(s => [s.setNumbers, s.uses], shallow);
  React.useEffect(() => setNumbers(
    citations.reduce(
      (obj, { key }, i) => ({ ...obj, [key]: i }),
      {}
    )
  ), [setNumbers, citations]);
 
  // render the application
  return (
    <div ref={ ref } style={{ display: 'flex', flexDirection: 'column' }}>
      <Head title={ data.post.title } />
      <Navbar />
      <aside className={ sideTree } style={{ top: navbarHidden ? 0 : `${margin}px`, right: 0 }}>
        <Forest 
          className="is-hidden-desktop-only is-hidden-touch" 
          trees={ data.post.parent.tableOfContents.items || [] } 
          current={ current } />
      </aside>
      <div className="is-marginless is-paddingless">
        <div className="columns">
          <div 
            className="column is-two-thirds-widescreen is-full-desktop" 
            style={{ margin: '0 auto' }}>
            <div className={ `${content} content` }>
              <div className="section">
                <Title { ...data.post }/>
                <MDXRenderer>{data.post.body}</MDXRenderer>
              </div>
              <References citations={ citations } uses={ uses } />
              <RelatedPosts posts={ data.post.related } />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function References({ citations, uses }) {
  return citations.length ? (
    <div className="section">
      <h1>References</h1>
        <div style={{ overflowX: 'auto' }}>{ 
          citations.map((citation, i) => 
            <div key={ citation.key } style={{ display: 'flex', margin: '1em 0' }}>
              <span style={{ marginRight: '0.5em' }}>{ `[${i}]` }</span>
              <Citation citation={ citation } uses={ uses[citation.key] } />
            </div>
          ) 
        }</div>
    </div>
  ) : null;
}

function RelatedPosts({ posts }) {
  return posts.length ? (<div className="section">
    <h1>Related posts</h1>
    <PostLinks>
      { posts.map(post => <PostLink key={ post.slug } { ...post } />) }
    </PostLinks>
  </div>) : null;
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
                href={ `#reference-${citation.key}-${i+1}` } 
                key={ i+1 } 
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
      parent {
        ... on Mdx {
          tableOfContents
        }
      }
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
