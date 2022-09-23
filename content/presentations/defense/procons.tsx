import React from 'react';

function ProCons({ children, ...props }: React.PropsWithChildren<any>) {
  return <ul { ...props }>{ children }</ul>;
}

function ProConItem({ children, ...props }: React.PropsWithChildren<any>) {
  const childrenArray = React.Children.toArray(children);
  return (
    <li { ...props }>
      <span>{ childrenArray.at(0) }</span>
      <ul className="list-none">{ childrenArray.slice(1) }</ul>
    </li>
  );
}

function Pro({ children, ...props }: React.PropsWithChildren<any>) {
  return <li { ...props }><i className="green fa fa-plus pr-4" />{ children }</li>;
}

function Con({ children, ...props }: React.PropsWithChildren<any>) {
  return <li { ...props }><i className="pink fa fa-minus pr-4" />{ children }</li>;
}

export { ProCons, ProConItem, Pro, Con };
