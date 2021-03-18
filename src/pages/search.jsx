import React from 'react';

import QueryPosts from '../components/query-posts';
import Head from '../components/head';
import Navbar from '../components/navbar';

export default function Search({ location }) {
  return <>
    <Head title={ 'Search' } />
    <div>
      <Navbar />
      <div className="container">
        <div className="content">
          <div className="section">
            <h1>Search posts</h1>
            <div style={{ padding: '0 0.5em' }}>
              <QueryPosts { ...(location.state || {}) }/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>;
}
