import React from 'react';
import { useLocation } from '@reach/router';

import QueryPosts from '../components/query-posts';
import Head from '../components/head';
import Navbar from '../components/navbar';


export default function Search() {
  const location = useLocation();
  const tagsRegex = /(?<=tags\[\]=)[a-zA-Z\-]+(?=&)?/g; // eslint-disable-line
  const tags = [ ...location.search.matchAll(tagsRegex) ].map(m => m[0]);
  return <>
    <Head title={ 'Search' } />
    <div>
      <Navbar />
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
    </div>
  </>;
}
