import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import { PostLink, PostLinks } from './post-links';

/**
 * Components
 */
export default function QueryPosts({ 
  title, 
  dates=[undefined, undefined],
  tags,
  empty,
}) {
  // hook for establishing page data
  const data = usePosts();

  // filter the page data
  const matched = data.allPost.nodes
    .filter(page => testMatch(page, { dates, title, tags }))
    .map(({ id, ...p }) => <PostLink key={ id } filterTags={ tags } { ...p } />);

  // render
  return (
    matched.length
    ? <PostLinks>{ matched }</PostLinks>
    : (empty || <div>No posts match your query</div>)
  );
}



/**
 * data hook
 */
function usePosts() {
  return useStaticQuery(graphql`
    query {
      allPost(sort: { fields: [date, title], order: [DESC, DESC] }) {
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

/**
 * our functions for testing a match
 */
function testMatch(page, { dates, title, tags }) {
  return (
    compareDates(dates[0], page.date)
    && compareDates(page.date, dates[1])
    && testTitle(title, page.title)
    && testTags(tags, page.tags)
  );
}

function compareDates(date1, date2) {
  // if a date is not provided, it is immediately true; otherwise, use Date API
  if (!date1 || !date2) return true
  return (new Date(date1)).getTime() <= (new Date(date2)).getTime();
}

function testTitle(title, pageTitle) {
  return (!title || pageTitle.toLocaleLowerCase().includes(title.toLocaleLowerCase()));
}

function testTags(tags, pageTags) {
  return !Array.isArray(tags) || tags.every(tag => pageTags.includes(tag));
}
