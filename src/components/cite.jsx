import React from 'react';
import { Link } from 'gatsby';
import shallow from 'zustand/shallow';

import useCitations from '../hooks/use-citations';

export default function Cite({ bibKey, children, id }) {
  const [reference, numbers] = useCitations(
    state => [state.reference, state.numbers], 
    shallow
  );
  const number = `${numbers[bibKey]}` || '?';
  React.useEffect(() => reference(bibKey, id), [reference, bibKey, id]);
  return (
    <Link to={ `#references-${bibKey}` } id={ `reference-${bibKey}-${id}` }>
      <span>{ children }</span>
      <span style={{ marginLeft: children ? '0.25em' : 0 }}>
        { `[${number}]` }
      </span>
    </Link>
  );
}
