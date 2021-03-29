import React from 'react';
import { Link } from 'gatsby';

import useCitations from '../hooks/use-citations';

export default function Cite({ bibKey, children }) {
  const getNumber = useCitations(state => state.getNumber);
  const number = getNumber(bibKey);
  return (
    <Link to={ `#references-${bibKey}` }>
      <span>{ children }</span>
      <span style={{ marginLeft: children ? '0.25em' : 0 }}>{ `[${number}]` }</span>
    </Link>
  );
}
