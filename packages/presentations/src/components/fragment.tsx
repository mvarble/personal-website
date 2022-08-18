import React from 'react';
import fp from 'lodash/fp';

import useDeck from '../hooks/use-deck';
import { isNonnegativeInteger } from '../utils';

interface FragmentProps {
  slideIndex: string | number;
  index: string | number;
  startOn: boolean;
  out: boolean;
  semiOut: boolean;
  appearDown: boolean;
  appearUp: boolean;
  appearRight: boolean;
  appearLeft: boolean;
  grow: boolean;
}

export default function Fragment(
  { 
    children, 
    slideIndex: sI, 
    index: i, 
    startOn, 
    out,
    semiOut,
    appearDown,
    appearUp,
    appearRight,
    appearLeft,
    grow,
  }: React.PropsWithChildren<FragmentProps>
) {
  // parse the props
  const slideIndex = parseIndex(sI);
  const index = parseIndex(i);

  // interface with deck state for visibility
  const slideState = useDeck(deck => deck.slideState);

  // calculate visibility off of slide state
  let visibilityClass: string;
  if (slideState) {
    const { indexh, indexf } = slideState;
    if (slideIndex < indexh) {
      visibilityClass = 'past';
    } else if (slideIndex === indexh) {
      if (index < indexf) {
        visibilityClass = 'past';
      } else if (index === indexf) {
        visibilityClass = 'present';
      } else {
        visibilityClass = 'future';
      }
    } else {
      visibilityClass = 'future';
    }
  } else {
    visibilityClass = 'future';
  }

  // ensure one child per `Fragment`
  const newChildren = React.useMemo(() => (
    React.Children.map(children, child => {
      const className =  (
        (fp.get('props.className')(child) || '') + ' '
        + 'fragment ' 
        + visibilityClass + ' '
        + (out ? 'out ' : '')
        + (semiOut ? 'semi-out ' : '')
        + (startOn ? 'start-on ' : '')
        + (appearDown ? 'appear-down ' : '')
        + (appearUp ? 'appear-up ' : '')
        + (appearLeft ? 'appear-left ' : '')
        + (appearRight ? 'appear-right ' : '')
        + (grow ? 'grow ' : '')
      );
      return React.cloneElement(child as React.ReactElement, { className, index, slideIndex });
    })
  ), [children, visibilityClass, semiOut, startOn]);

  return <>{ newChildren }</>;
}

function parseIndex(index: string | number): number {
  const indexNumber = Number(index);
  if (isNonnegativeInteger(indexNumber)) {
    return indexNumber;
  } else {
    throw new Error('Fragment: index must be a nonnegative integer!');
  }
}
