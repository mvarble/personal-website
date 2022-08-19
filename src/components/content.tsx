import React from 'react';

type HTMLDiv = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>, 
  HTMLDivElement
>;

export function ContentContainer(props: HTMLDiv) {
  const { className: classNamePost, ...other } = props;
  let className = 'flex flex-row justify-start';
  className = classNamePost ? className + ' ' + classNamePost : className;
  return (
    <div className={ className } { ...other } />
  );
}

export function Content(props: HTMLDiv) {
  const { className: classNamePost, ...other } = props;
  let className = 'w-full lg:w-[1024px] px-4';
  className = classNamePost ? className + ' ' + classNamePost : className;
  return (
    <div className={ className } { ...other } />
  );
}

export function PreContent(props: HTMLDiv) {
  const { className: classNamePost, ...other } = props;
  let className = 'hidden md:block md:flex-1';
  className = classNamePost ? className + ' ' + classNamePost : className;
  return (
    <div className={ className } { ...other } />
  );
}

export function PostContent(props: HTMLDiv) {
  const { className: classNamePost, ...other } = props;
  let className = 'hidden 2xl:block 2xl:flex-1 2xl:grow-[2]';
  className = classNamePost ? className + ' ' + classNamePost : className;
  return (
    <div className={ className } { ...other } />
  );
}
