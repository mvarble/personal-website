import React from 'react';
import { graphql, Link } from 'gatsby';

import { updateClass } from '../utils/themes';
import useKeyboardShortcuts from '../hooks/use-keyboard-shortcuts';

interface LayoutProps {
  data: {
    allPresentation: {
      nodes: Presentation[];
    };
  };
};

interface Presentation {
  date: string;
  slug: string;
  title: string;
}

export default function Layout(props: LayoutProps) {
  useKeyboardShortcuts();
  props.data.allPresentation.nodes.forEach(node => console.log((new Date(node.date)).toISOString().slice(0,10)));
  return (
    <div className="w-screen h-screen">
      <div className="flex flex-col justify-center w-full h-full">
        <h1 className="text-center">Presentations</h1>
        <div className="flex flex-col w-4/5 mx-auto mt-8 max-w-screen-lg">
          {
            props.data.allPresentation.nodes.map(node => (
              <Link className="flex flex-row p-4 border border-b-0 hover:no-underline active:no-underline bg-neutral-100 border-stone-700 last:border-b hover:bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-900 dark:hover:bg-neutral-700" to={ `/presentations${node.slug}` }>
                <span className="flex-1">{ node.title }</span>
                <span>{ (new Date(node.date)).toISOString().slice(0, 10) }</span>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export const query = graphql`
  query {
    allPresentation(sort: {fields: date, order: DESC}) {
      nodes {
        date
        slug
        title
      }
    }
  }
`;

export function Head() {
  React.useEffect(updateClass, []);
  return <>
    <title>{ `Presentations | rodent.club` }</title>
  </>;
}
