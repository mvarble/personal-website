import React from 'react';
import fp from 'lodash/fp';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { useStaticQuery, graphql } from 'gatsby';

import { tagBlock } from './index.module.scss';

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
  // create a ref/callback for d3 to edit the dom
  const ref = React.useRef();
  React.useEffect(() => {
    // establish the cloud algorithm
    const layout = cloud()
      .size([300, 300])
      .words(tags)
      .padding(5)
      .rotate(() => -10 + Math.random() * 10)
      .fontSize(d => 30 * d.scale)
      .on("end", words => draw(words, ref.current));

    // run the cloud algorithm
    layout.start();

    // create and return the cleanup function
    const cleanup = () => d3.select(ref.current).selectAll('*').remove();
    return cleanup;
  }, [ref, tags]);

  return <div ref={ ref } className={ tagBlock } />;
}

function draw(words, dom) {
  d3.select(dom).append("svg")
    .attr("width", 300)
    .attr("height", 300)
    .append("g")
    .attr("transform", `translate(150, 150)`)
    .selectAll("text")
    .data(words)
    .enter()
    .append("a")
    .attr("xlink:href", d => `/search?tags[]=${d.text}`)
    .append("text")
    .text(d => d.text)
    .style("font-size", d => d.size + "px")
    .style("font-family", d => d.font)
    .style("fill", (_, i) => d3.interpolateInferno(0.8*(1 - i / words.length)))
    .attr("text-anchor", "middle")
    .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`);
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
  const scale = d3.scaleLinear()
    .domain(countRange)
    .range([1.0, 0.25]);

  // preprocess for d3-cloud and rendering
  return firstPass
    .map(obj => ({ ...obj, scale: scale(obj.count) }))
    .sort((a, b) => a.count < b.count ? -1 : 1);
}
