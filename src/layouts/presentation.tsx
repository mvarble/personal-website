import React from 'react';
import { graphql } from 'gatsby';

import { Deck } from '@presentations';
import { updateClass } from '../utils/themes';
import useKeyboardShortcuts from '../hooks/use-keyboard-shortcuts';
import NavButton from '../components/nav-button';

export interface PresentationData {
  title: string;
  slug: string;
  date: string;
  width: number;
  height: number;
  fragmentsBySlide: number[];
}

export interface PresentationProps {
  location: {
    hash: string;
  };
  data: {
    presentation: PresentationData;
  };
}

export default function Presentation(props: React.PropsWithChildren<PresentationProps>) {
  useKeyboardShortcuts();
  return (
    <div className="w-screen h-screen relative">
      <Deck { ...props }/>
      <NavButton />
    </div>
  );
}

export function Head(props: PresentationProps) {
  React.useEffect(updateClass, []);
  return <>
    <title>{ `${props.data.presentation.title} | rodent.club` }</title>
  </>;
}

export const pageQuery = graphql`
  query($id: String!) {
    presentation(id: { eq: $id }) {
      title
      slug
      date
      width
      height
      fragmentsBySlide
    }
  }
`;
