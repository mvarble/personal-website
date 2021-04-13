import React from 'react';
import shallow from 'zustand/shallow';
import { Link } from 'gatsby';

import useCitations from '../hooks/use-citations';

export default function Cite({ bibKey, children }) {
  // use the state of citations
  const [getNumber, requestKey] = useCitations(
    state => [state.getNumber, state.requestKey],
    shallow
  );


  // memoize an id on first render
  const id = React.useMemo(() => requestKey(bibKey), [requestKey, bibKey]);

  // get a number for the citation
  const number = getNumber(bibKey);

  // render accordingly
  return (
    <Link to={ `#references-${bibKey}` } id={ `reference-${bibKey}-${id}` }>
      <span>{ children }</span>
      <span style={{ marginLeft: children ? '0.25em' : 0 }}>
        { `[${number}]` }
      </span>
    </Link>
  );
}
