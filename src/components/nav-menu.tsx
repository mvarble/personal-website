import React from 'react';
import { Link } from 'gatsby';

interface NavMenuProps extends React.HTMLProps<HTMLDivElement> {
  open: boolean;
  up: boolean
}

export default function NavMenu({ open, up, ...props }: NavMenuProps) {
  return (
    <div { ...props }>
      <div className={ `
        border bg-stone-50 border-stone-300 dark:bg-neutral-800 dark:border-stone-900
        transition-all flex 
        select-none
        ${ open ? 'scale-y-100' : 'scale-y-0' }
        ${ up ? 'origin-bottom flex-col-reverse' : 'origin-top flex-col' }` }>
        {
          [
            ['home', '/'], 
            ['posts', '/posts'], 
            ['presentations','/presentations'], 
            ['books', '/books']
          ].map(([title, href]) => (
            <Link className="active:no-underline focus:no-underline hover:no-underline text-neutral-800 dark:text-slate-300 p-4 hover:bg-neutral-200 active:bg-neutral-200 dark:hover:bg-neutral-700 dark:active:bg-neutral-700" to={ href }>{ title }</Link>
          ))
        }
      </div>
    </div>
  )
}
