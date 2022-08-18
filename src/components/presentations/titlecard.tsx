import React from 'react';
import shallow from 'zustand/shallow';

import { useDeck } from '@presentations';

export default function Titlecard({ email, children }: React.PropsWithChildren<{ email: string }>) {
  const presentation = useDeck(deck => deck, shallow);
  if (typeof presentation === 'undefined') {
    return null;
  } else {
    const { title, date } = presentation;
    return (
      <div className="flex flex-col justify-center h-full text-center">
        <h1 className="pb-4 leading-snug">{ title }</h1>
        <div className="text-base">{ String(date) }</div>
        <h2 className="pt-8 pb-2 text-3xl no-underline green">Matthew Varble</h2>
        <div className="text-sm">
          <a href={ `mailto:${email}` }>{ email }</a>
          { children }
        </div>
      </div>
    );
  }
}
