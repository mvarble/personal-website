import React from 'react';

export default function Proof({ children }) {
  // create a state for whether or not the proof is collapsed
  const [collapsed, setCollapsed] = React.useState(true);

  // create the callbacks
  const open = {
    onClick: () => setCollapsed(false),
    onKeyDown: () => setCollapsed(false),
  };
  const collapse = {
    onClick: () => setCollapsed(true),
    onKeyDown: () => setCollapsed(true),
  };

  // render accordingly
  return (
    <blockquote>
      <button 
        className="button is-info" 
        style={{ display: collapsed ? 'inherit' : 'none' }} 
        { ...open }>
        Show proof.
      </button>
      <div style={{ display: collapsed ? 'none' : 'inherit' }}>
        <strong style={{ color: 'var(--link)' }}>Proof.&nbsp;</strong>
        { children }
        <button 
          className="button is-info" 
          style={{ display: 'block', margin: '0.5em auto' }}
          { ...collapse }>
          Hide proof.
        </button>
      </div>
    </blockquote>
  );
}
