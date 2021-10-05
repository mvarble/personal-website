import React from 'react';

export default function SVGElement({ data, ...props }) {
  // create a ref for the svg group
  const ref = React.useRef();
  React.useEffect(() => {
    if (!ref.current) return;
    // clear the ref's children
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    // hacky workaround of Gatsby's url-loader to get svg xml data
    const parser = new DOMParser();
    const byteData = data.split(',')[1];
    const stringData = atob(byteData);
    const xml = parser.parseFromString(stringData, 'image/svg+xml');

    // iterate over the children, appending each non-xml child
    Array.from(xml.activeElement.children)
      .forEach(child => {
        if (['namedview', 'defs'].includes(child.localName)) return;
        ref.current.appendChild(child);
      });
  }, [ref, data]);

  // render
  return <g ref={ ref } { ...props }/>
}
