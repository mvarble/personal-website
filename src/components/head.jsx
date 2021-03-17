import React from 'react';
import { Helmet } from 'react-helmet';

export default function Head({ title, children }) {
  return (
    <Helmet>
      <title>{ title ? `${title} | rat.supply` : 'rat.supply' }</title>
      <meta property="og:title" content="rat.supply" />
      <meta property="og:description" content="Matthew Varble's personal website" />
      <meta property="og:image" content="https://rat.supply/site-image.png" />
      <meta property="og:url" content="https://rat.supply" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      { children }
    </Helmet>
  );
}
