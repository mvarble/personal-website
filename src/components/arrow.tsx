import React from 'react';

import { ColorChoices, colorsByTheme } from '../utils/colors';
import { useTheme } from '../hooks/use-theme';

interface ArrowProps {
  x0: number;
  y0: number;
  strokeWidth: number;
  x1?: number;
  y1?: number;
  dx?: number;
  dy?: number;
  markerLength?: number;
  markerWidth?: number;
  color?: ColorChoices;
}

export default function Arrow(props: ArrowProps) {
  // interface with theme to get the correct color
  const theme = useTheme();

  // parse the color
  const color = React.useMemo(() => {
    const colors = colorsByTheme(theme);
    if (typeof props.color === 'undefined' || typeof colors[props.color] === 'undefined') {
      return colors.text;
    } else {
      return colors[props.color];
    }
  }, [theme, props.color]);

  // throw error if props used incorrectly
  if (
    (typeof props.dx === 'undefined' && typeof props.x1 === 'undefined')
    || (typeof props.dy === 'undefined' && typeof props.y1 === 'undefined')
    || (typeof props.x1 !== 'undefined' && typeof props.y1 === 'undefined')
    || (typeof props.x1 !== 'undefined' && typeof props.dx !== 'undefined')
    || (typeof props.y1 !== 'undefined' && typeof props.x1 === 'undefined')
    || (typeof props.y1 !== 'undefined' && typeof props.dy !== 'undefined')
  ) {
    throw new Error('Arrow: this component requires attributes (x1 and y1) xor (dx and dy)');
  }

  // calculate important points
  const { 
    x0, 
    y0, 
    x1: x1Pre, 
    y1: y1Pre, 
    dx, 
    dy, 
    strokeWidth,
    markerWidth: markerWidthPre, 
    markerLength: markerLengthPre, 
    ...otherProps
  } = props;

  // calculate the marker points
  const { x1, y1, px0, py0, px1, py1 } = React.useMemo(() => {
    // @ts-ignore
    const x1 = typeof x1Pre === 'undefined' ? x0 + dx : x1Pre;
    // @ts-ignore
    const y1 = typeof y1Pre === 'undefined' ? y0 + dy : y1Pre;
    const markerWidth = typeof markerWidthPre === 'undefined' ? 1.5 : markerWidthPre;
    const markerLength = typeof markerLengthPre === 'undefined' ? 3.0 : markerLengthPre;
    const length = Math.sqrt(Math.pow(y1-y0, 2) + Math.pow(x1-x0, 2));
    const normalize = strokeWidth / length;
    const baseCenterX = x1 + markerLength * normalize * (x0 - x1);
    const baseCenterY = y1 + markerLength * normalize * (y0 - y1);
    const displacementX = markerWidth * normalize * (y0 - y1);
    const displacementY = markerWidth * normalize * (x1 - x0);
    const px0 = baseCenterX + displacementX;
    const py0 = baseCenterY + displacementY;
    const px1 = baseCenterX - displacementX;
    const py1 = baseCenterY - displacementY;
    return {  x1, y1, px0, py0, px1, py1 };
  }, [x0, y0, x1Pre, y1Pre, dx, dy, strokeWidth, markerLengthPre, markerWidthPre]);

  // render the svg contents
  return (
    <g>
    <path
      { ...otherProps }
      stroke={ color }
      fill={ color }
      strokeWidth={ strokeWidth }
      d={ 
        `M ${x0},${y0} 
        L ${x1},${y1} 
        M ${px0},${py0}
        L ${x1},${y1}
        L ${px1},${py1}
        L ${px0},${py0}
        L ${x1},${y1}
        ` } />
    </g>
  );
}
