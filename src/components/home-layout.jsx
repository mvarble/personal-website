import React from 'react';

export default function HomeLayout({ children }) {
  return (
      <div className="is-marginless is-paddingless">
        <div className="section">
          <div className="columns">
            <div className="column is-two-thirds-widescreen is-full-desktop" style={{ margin: '0 auto' }}>
              <div className="content">
                { children }
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
