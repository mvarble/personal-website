import React from 'react';

import useKaTeX from '../hooks/use-katex';

export default function TeX({ children, ...props }) {
  const ref = useKaTeX(children);
  return <span ref={ ref } { ...props }>{ children }</span>;
}
