import React from 'react';
import { scene } from './index.module.scss';

export default function Diagram({ children }) {
  return (
    <div style={{ margin: '1em' }}>
      <div className={ `${scene} card` } style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-image">
          { Array.isArray(children) ? children[0] : null }
        </div>
        <div className="card-content">
          { Array.isArray(children) ? children.slice(1) : null }
        </div>
      </div>
    </div>
  );
}
