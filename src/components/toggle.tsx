import React from 'react';

type HTMLButton = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>, 
  HTMLButtonElement
>;

interface ToggleProps extends HTMLButton {
  on: boolean;
  onLogo?: React.ReactNode,
  offLogo?: React.ReactNode,
}

export default function Toggle({ on, onLogo, offLogo, ...props }: ToggleProps) {
  return (
    <button { ...props }>
      <div 
        className={
          `flex flex-row relative 
          ${ on ? 'child:last:left-4 child:hover:last:left-3.5' : 'child:last:left-0 child:hover:last:left-0.5' }
        `}>
        <div className="border border-slate-900/50 rounded-full w-12 h-8 
          bg-neutral-700/25 dark:bg-neutral-700/50" />
        <div className={ `
          transition-all duration-250
          flex absolute rounded-full w-8 h-8 bg-neutral-300 dark:bg-neutral-500 scale-[80%]
        `}>
          { on ? onLogo : offLogo }
        </div>
      </div>
    </button>
  );
}
