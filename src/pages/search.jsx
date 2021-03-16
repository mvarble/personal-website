import React from 'react';

import QueryPosts from '../components/query-posts';

export default function Search({ location }) {
  const tagsRegex = /(?<=tags\[\]=)[a-zA-Z\-]+(?=&)?/g;
  const tags = [ ...location.search.matchAll(tagsRegex) ].map(m => m[0]);
  return (
    <div className="container">
      <div className="content">
        <div className="section">
          <h1>Search posts</h1>
          <div style={{ padding: '0 0.5em' }}>
            <QueryPosts tags={ tags }/>
          </div>
        </div>
      </div>
    </div>
  );
}
