import React from 'react';
import KaTeX from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';

export function TeX(props: React.PropsWithChildren<any>) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      if (typeof props.children !== 'string') {
        throw new Error('TeX: this component requires a single string as a child');
      } else {
        KaTeX.render(props.children, ref.current);
      }
    }
  }, [ref.current, props.children]);
  return <span ref={ ref } { ...props } />;
}

export function RefTeX(props: React.PropsWithChildren<any>) {
  // create a ref of the element we intend to parse
  const ref = React.useRef(null);

  // parse the katex
  React.useEffect(() => {
    if (ref.current) {
      renderMathInElement(
        ref.current, 
        { 
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
          ]
        },
      );
    }
  }, [ref.current, props.children]);

  // return a referenced span for the body
  return <span ref={ref} {...props} />;
}
