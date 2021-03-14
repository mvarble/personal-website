import React from 'react';
import { useStaticQuery, graphql, navigate } from 'gatsby';

import { posts } from './index.module.scss';

export default function PostsFromQuery({ 
  startDate, 
  endDate, 
  title, 
  tags
}) {
  // hook for establishing page data
  const data = usePages();

  // filter the page data
  const matched = data.allPage.nodes.filter(page => 
    compareDates(startDate, page.date)
    && compareDates(page.date, endDate)
    && (!title || page.title.includes(title))
    && (
      !Array.isArray(tags)
      || tags.every(tag => page.tags.includes(tag))
    )
  ).map(({ id, ...page }) => <Post key={ id } filterTags={ tags } { ...page } />);


  return <div className={ posts }>{ matched }</div>;
}

function Post({ title, slug, date, tags, filterTags, ...props }) {
  const tagStyle = tag => (
    Array.isArray(filterTags) && filterTags.includes(tag)
    ? 'tag is-info'
    : 'tag'
  );
  const styledTags = tags.map(tag => (
    <span key={ tag } className={ tagStyle(tag) } style={{ margin: '0 0.25em' }}>
      { tag }
    </span>
  ));

  return (
    <div onClick={ () => navigate(slug) }>
      <span 
        className="is-size-3"
        style={{ color: 'var(--primary)' }}>
        { title }
      </span>
      <div style={{ paddingLeft: '1em' }}>
        { styledTags }
      </div>
    </div>
  );
}

function usePages() {
  return useStaticQuery(graphql`
    query {
      allPage(sort: { fields: [date, title], order: [DESC, DESC] }) {
        nodes {
          title
          slug
          date
          tags
          id
        }
      }
    }
  `);
}

function compareDates(date1, date2) {
  // if a date is not provided, it is immediately true; otherwise, use Date API
  if (!date1 || !date2) return true
  return (new Date(date1)).getTime() <= (new Date(date2)).getTime();
}
