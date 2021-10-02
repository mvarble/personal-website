import React from 'react';
import remarkEmoji from 'remark-emoji';
import ReactMarkdown from 'react-markdown';

export default function Markdown({ children }) {
  return (
    <ReactMarkdown children={ children } remarkPlugins={[remarkEmoji]} />
  );
}

