import React from 'react';
import * as d3 from 'd3';
import shallow from 'zustand/shallow';

import useTheme from '@hooks/use-theme';
import { colorsByTheme, Palette } from '@utils/colors';

import { useDeck } from '@presentations';

interface MeasureChangeProps {
  count: number,
}

type SVGSel = d3.Selection<SVGSVGElement, undefined, null, undefined> | null;

class MeasureChangeDiagram {
  svg: SVGSel;
  constructor(stage: number, colors: Palette) {
    this.svg = d3.create('svg');
    this.svg
      .style('margin', 'auto')
      .attr('height', '100%')
      .attr('viewBox', '0 0 300 100');
    this.svg.append('g').attr('class', 'initial');
    this.svg.append('g').attr('class', 'p-samples');
    this.svg.append('g').attr('class', 'q-samples');
    this.render(stage, colors);
  }

  render(stage: number, colors: Palette) {
    const svg = this.svg;
    if (!svg) return;
    if (stage >= 0) {
      svg.select('.initial')
        .selectAll('circle')
        .data([[100, 50]])
        .enter()
        .append('circle')
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .attr('fill', colors.orange)
        .attr('stroke', colors.orange)
        .attr('fill-opacity', 0.5)
        .transition()
        .duration(250)
        .attr('r', 5)
    } else {
      svg.select('.initial').selectAll('*').remove();
    }
    if (stage >= 1) {
      svg
        .select('.p-samples')
        .selectAll('circle')
        .data(PSAMPLES)
        .enter()
        .append('circle')
        .attr('cx', d => d[0] + 3 * Math.random())
        .attr('cy', d => d[1] + 3 * Math.random())
        .attr('fill', colors.pink)
        .attr('stroke', colors.pink)
        .attr('fill-opacity', 0.5)
        .transition()
        .duration(250)
        .delay((_, i) => 50 * i)
        .attr('r', 2)
    } else {
      svg.select('.p-samples').selectAll('*').remove();
    }
    if (stage >= 2) {
      svg
        .select('.q-samples')
        .selectAll('circle')
        .data(QSAMPLES)
        .enter()
        .append('circle')
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .attr('fill', colors.green)
        .attr('stroke', colors.green)
        .attr('fill-opacity', 0.5)
        .transition()
        .duration(250)
        .delay((_, i) => 50 * i)
        .attr('r', 2)
    } else {
      svg.select('.q-samples').selectAll('*').remove();
    }
  }
}

const PSAMPLES = Array.from({ length: 25 }).map(_ => {
  return [180 + 45 * Math.random(), 45 + 45 * Math.random()];
});

const QSAMPLES = Array.from({ length: 25 }).map(_ => {
  return [100 + 45 * (0.5 - Math.random()), 50 + 45 * (0.5 - Math.random())];
});

export default function MeasureChage({ count, ...props }: MeasureChangeProps) {
  // build a reference for d3 to play with
  const ref = React.useRef<HTMLDivElement>(null);

  // create a state for the diagram
  const [diagram, setDiagram] = React.useState<MeasureChangeDiagram | null>(null);
  const [stager, setStager] = React.useState<(arg0: any) => number>(() => (_ => -1));

  // interface with deck state to get the stage
  const [slideState, getParentSlide] = useDeck(d => [d.slideState, d.getParentSlide], shallow);

  // interface with colors
  const theme = useTheme();
  const colors = colorsByTheme(theme);

  // establish the svg on reference change
  React.useEffect(() => {
    if (!ref.current) return;
    const elm = ref.current;
    const stager = slideState => {
      if (!slideState || !slideState.indexf || !slideState.indexh) return -1;
      const parentSlide = getParentSlide(elm);
      const { indexh, indexf } = slideState;
      if (indexh < parentSlide) return -1;
      if (indexh > parentSlide) return 2;
      return indexf - 6;
    };
    setStager(() => stager);
    const diagram = new MeasureChangeDiagram(stager(slideState), colors);
    setDiagram(diagram);
    const node = diagram.svg && diagram.svg.node();
    node && elm.appendChild(node);
    return () => { elm.innerHTML = '' };
  }, [ref.current, getParentSlide]);

  // build state depending on deck
  React.useEffect(() => {
    if (!diagram) return;
    diagram.render(stager(slideState), colors);
  }, [stager, slideState, colors]);

  return <div { ...props } ref={ ref } />;
}
