import React from 'react';
import fp from 'lodash/fp';
import { scaleLinear, interpolateViridis }  from 'd3';
import cloud from 'd3-cloud';
import { useStaticQuery, graphql, Link } from 'gatsby';

import { tagBlock } from './index.module.scss';

const interpolateColor = interpolateViridis;

export default function TagBlock() {
  const data = useStaticQuery(graphql`
    query {
      allPost {
        nodes {
          tags
        }
      }
    }
  `);
  return <Tags tags={ processTags(data.allPost.nodes) } />
}

function Tags({ tags }) {
  // create a ref to measure the size of the window
  const ref = React.useRef();

  // create a state
  const [state, setState] = React.useState({ width: 0, words: [] });

  // create a callback for resizes
  const resize = React.useCallback(
    size => setState(fp.set('width')(Math.min(size, 500))), 
    [setState]
  );

  // effect: initialize width
  React.useEffect(() => {
    if (state.width !== 0) return;
    resize(ref.current.parentElement.offsetWidth - 50);
  }, [state, resize, ref]);

  // effect: change dimensions on parent resizes
  React.useEffect(() => {
    const observer = new ResizeObserver(entries => entries.forEach(entry => {
      resize(entry.contentRect.width - 50);
    }));
    observer.observe(ref.current.parentElement);
    return () => observer.disconnect();
  }, [resize, ref]);

  // effect: if tags change, clear words
  React.useEffect(() => {
    setState(fp.set('words')([]));
  }, [tags]);

  // effect: run d3-cloud
  React.useEffect(() => {
    // only populate if words don't exist
    if (state.words.length) return;
    
    // establish the cloud algorithm
    const layout = cloud()
      .size([300, 300])
      .words(tags)
      .padding(5)
      .rotate(() => -10 + Math.random() * 10)
      .fontSize(d => 30 * d.scale)
      .on("end", words => setState(fp.set('words')(words)));

    // run the cloud algorithm
    layout.start();
  }, [state, setState, tags]);

  // render the div
  return (
    <div ref={ ref } className={ tagBlock } >
      <svg viewBox="0 0 300 300" width={ state.width } height={ state.width }>
        <g transform="translate(150, 150)">
          {
            state.words.map(({ text, size, x, y, rotate, font }, i) => (
              <Link to="/search" state={{ tags: [text] }} key={ text }>
                <text
                  textAnchor="middle"
                  transform={ `translate(${x}, ${y}) rotate(${rotate})` }
                  style={{
                    fontFamily: font,
                    fontSize: `${size}px`,
                    fill: interpolateColor(0.8 * (1 - i / state.words.length)),
                  }}>
                  { text }
                </text>
              </Link>
            ))
          }
        </g>
      </svg>
    </div>
  );
}

function processTags(pages) {
  // run through all the pages to count the tags
  const firstPass = pages
    .reduce((arr1, { tags }) => tags.reduce((arr2, tag) => {
      const index = arr2.findIndex(obj => obj.text === tag);
      return (
        index < 0
        ? [...arr2, { text: tag, count: 1 }]
        : fp.update(`[${index}].count`)(k => k + 1)(arr2)
      );
    }, arr1), []);

  // we induce scale from count in a linear fashion
  const countRange = firstPass.reduce(([min, max], { count }) => [
    count < min ? count : min,
    count > max ? count : max,
  ], [0, 0]);
  const scale = scaleLinear().domain(countRange).range([0.25, 1.0]);

  // preprocess for d3-cloud and rendering
  return firstPass
    .map(obj => ({ ...obj, scale: scale(obj.count) }))
    .sort((a, b) => a.count < b.count ? -1 : 1);
}
