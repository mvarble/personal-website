import React from 'react';
import { Link } from 'gatsby';

export default function Title({ title, tags, date }) {
  return (
    <div style={{ borderBottom: '1px solid var(--grey)', marginBottom: '1em' }}>
      <h1>{ title }</h1>
      <div style={{ fontSize: 'small' }}>published on { date }</div>
      <div style={{ margin: '1em' }}>
        { 
          tags.map(tag => 
            <Link to="/search" state={{ tags: [tag] }} key={ tag }>
              <button 
                className="button is-small is-success is-rounded is-outlined"
                style={{ margin: '0.25em', fontSize: '10px' }}
              >
                { tag }
              </button>
            </Link>
          )
        }
      </div>
    </div>
  );
}
