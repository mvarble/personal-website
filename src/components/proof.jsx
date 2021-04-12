import React from 'react';

export default function Proof({ withBlock=true, children, ...props }) {
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
  const main = <>
      <div style={{ display: collapsed ? 'inherit' : 'none' }}>
        <button 
          className="button is-info" 
          style={{ display: 'block', margin: '0.5em auto' }}
          { ...open }>
          Show proof.
        </button>
      </div>
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
  </>;
  return (
    withBlock 
    ? <blockquote { ...props }>{ main }</blockquote> 
    : <div { ...props }>{ main }</div>
  );
}
