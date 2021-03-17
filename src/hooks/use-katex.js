import React from 'react';
import useMutationObserver from "@rooks/use-mutation-observer"
import renderMathInElement from 'katex/dist/contrib/auto-render.js';

import katexConfig from '../katex';

export default function useKaTeX(data) {
  // create a ref so that we can allow KaTeX to manipulate DOM
  const ref = React.useRef();

  // observe KaTeX mutations so that we can wrap display math in scroll box
  useMutationObserver(ref, () => {
    ref.current.querySelectorAll('span.katex-display').forEach(elm => {
      const parent = elm.parentNode;
      if (
        parent.tagName !== 'DIV' || !parent.classList.contains('katex-scroll')
      ) {
        parent.innerHTML = `<div class="katex-scroll">${parent.innerHTML}</div>`;
      }
    });
  });

  // parse the katex
  React.useEffect(() => {
    renderMathInElement(
      ref.current, 
      { 
        ...katexConfig,
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false},
        ]
      },
    );
  }, [data, ref]);

  // return the ref
  return ref;
}
