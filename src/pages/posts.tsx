import React from 'react';
import { graphql, Link } from 'gatsby';

import { updateClass } from '../utils/themes';
import useKeyboardShortcuts from '../hooks/use-keyboard-shortcuts';
import NavButton from '../components/nav-button';

interface LayoutProps {
  data: {
    allPost: {
      nodes: Post[];
    };
  };
};

interface Post {
  date: string;
  slug: string;
  title: string;
}

export default function Layout(props: LayoutProps) {
  useKeyboardShortcuts();
  return (
    <div className="w-screen h-screen">
      <NavButton />
      <div className="flex flex-col justify-center w-full h-full">
        <h1 className="text-center">Posts</h1>
        <div className="flex flex-col w-4/5 mx-auto mt-8 max-w-screen-lg">
          {
            props.data.allPost.nodes.map(node => (
              <Link className="flex flex-row m-1 p-4 border hover:no-underline active:no-underline bg-neutral-100 border-stone-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-900 dark:hover:bg-neutral-700 hover:scale-105 focus:scale-105" to={ `/posts${node.slug}` }>
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
    allPost(sort: {fields: date, order: DESC}) {
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
    <title>{ `Posts | rodent.club` }</title>
  </>;
}
