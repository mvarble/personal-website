import React from 'react';

import QueryPosts from '../components/query-posts';

export default function Search() {
  return (
    <div className="container">
      <div className="content">
        <div className="section">
          <h1>Search posts</h1>
          <div style={{ padding: '0 0.5em' }}>
            <QueryPosts />
          </div>
        </div>
      </div>
    </div>
  );
}
