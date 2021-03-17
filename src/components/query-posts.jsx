import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import { PostLink, PostLinks } from './post-links';

/**
 * Components
 */
export default function QueryPosts({ 
  startDate, 
  endDate, 
  title, 
  tags
}) {
  // hook for establishing page data
  const data = usePosts();

  // filter the page data
  const matched = data.allPost.nodes
    .filter(page => testMatch(page, { startDate, endDate, title, tags }))
    .map(({ id, ...p }) => <PostLink key={ id } filterTags={ tags } { ...p } />);

  // render
  return (
    matched.length
    ? <PostLinks>{ matched }</PostLinks>
    : <div>No posts match your query</div>
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
function testMatch(page, { startDate, endDate, title, tags }) {
  return (
    compareDates(startDate, page.date)
    && compareDates(page.date, endDate)
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
  return (!title || pageTitle.includes(title));
}

function testTags(tags, pageTags) {
  return !Array.isArray(tags) || tags.every(tag => pageTags.includes(tag));
}
