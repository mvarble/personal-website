import React from 'react';
import { Link } from 'gatsby';

interface PostTitleProps {
  title: string;
  date: string;
  tags: string[];
}

export default function PostTitle({ title, date, tags }: PostTitleProps) {
  return (
    <div className="pb-4 mt-4 mb-8 border-b border-neutral-800 dark:border-slate-300">
      <div>
        <h1 className="text-6xl text-center">{ title }</h1>
        <div className="text-center">{ date }</div>
        <div className="flex flex-wrap w-3/5 mt-4 mx-auto justify-center">
          { 
            tags.map(tag => <TagLink tag={ tag } />)
          }
        </div>
      </div>
    </div>
  );
}

function TagLink({ tag }: { tag: string }) {
  return (
    <Link to="#" className={ `
      text-xs
      rounded-full p-2 m-1 
      hover:no-underline active:no-underline focus:no-underline 
      hover:scale-105 focus:scale-105 active:scale-105
      border-2
      border-sky-900
      dark:border-sky-300
    `}>
      #{ tag }
    </Link>
  );
}
