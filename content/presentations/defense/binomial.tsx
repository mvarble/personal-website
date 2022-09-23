import React from 'react';
import * as d3 from 'd3';

interface BinomialProps {
  count: number,
  scale: number,
  slope: number,
}

type NodeType = d3.Selection<SVGGElement, undefined, null, undefined>;

export default function Binomial({ count = 10, scale = 0.5, slope = 0.5, ...props }: BinomialProps) {
  // create a ref for d3
  const ref = React.useRef<HTMLDivElement>(null);

  // use d3 to draw the tree
  React.useEffect(() => {
    if (!ref.current) return;
    // get the element in question
    const elm = ref.current;

    // create the svg node
    const svg = d3.create('svg').attr('viewBox', `-1 -1 ${1.5 * 1/(1-scale)} ${1/(1-scale)}`).style('height', '100%').style('width', '100%');

    // create a root for the tree
    const root = svg
      .append('g')
      .attr('transform', `scale(${scale} ${scale})`)
    
    // create a recursion
    function recurse(sel: NodeType, remaining: number) {
      if (remaining > 0) {
        sel.append('path')
          .attr('d', `M 1 ${slope} L 0 0 L 1 -${slope}`)
          .attr('fill', 'none')
          .attr('stroke', 'gray')
          .attr('stroke-width', '0.05')
        recurse(
          sel.append('g').attr('transform', `translate(1 ${slope}) scale(${scale} ${scale})`), 
          remaining - 1
        )
        recurse(
          sel.append('g').attr('transform', `translate(1 -${slope}) scale(${scale} ${scale})`), 
          remaining - 1
        )
      }
      sel.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 0.3)
        .attr('fill', 'white')
        .attr('stroke-width', 0.1)
        .attr('stroke', 'gray');
    }
    recurse(root, count);

    // append the root to the dom
    const node = svg.node();
    node && elm.appendChild(node);

    // cleanup
    return () => { elm.innerHTML = ''; };
  }, [ref]);

  return <div { ...props } ref={ ref } />;
}
