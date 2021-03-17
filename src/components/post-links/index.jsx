import React from 'react';
import { Link } from 'gatsby';

import { post, posts } from './index.module.scss';

function PostLink({ title, slug, date, tags, filterTags }) {
  // create a quick function for deciding if a tag is highlighted
  const tagClass = tag => (
    Array.isArray(filterTags) && filterTags.includes(tag)
    ? 'tag is-info'
    : 'tag'
  );

  // map the tags to React components
  const styledTags = tags.map(tag => (
    <span key={ tag } className={ tagClass(tag) } style={{ margin: '0 0.25em' }}>
      { tag }
    </span>
  ));

  // render
  return (
    <Link to={ slug } className={ post }>
      <span 
        className="is-size-3"
        style={{ color: 'var(--danger)' }}>
        { title }
      </span>
      <div style={{ paddingLeft: '1em', fontSize: 'small', marginBottom: '0.5em' }}>
        { date }
      </div>
      <div style={{ paddingLeft: '1em' }}>
        { styledTags }
      </div>
    </Link>
  );
}

function PostLinks({ children }) {
  return <div className={ posts }>{ children }</div>;
}

export default PostLinks;
export { PostLink, PostLinks };
