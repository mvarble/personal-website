import React from 'react';
import { forest, branch, closed, highlighted } from './index.module.scss';
import { Link } from 'gatsby';

export default function Forest(props) {
  const { trees, current, className, ...otherProps } = props;
  return (
    <ul { ...otherProps } className={ `${forest} ${className || ''}` }>
      { trees.map(patternMatch(current)) }
    </ul>
  );
}

function patternMatch(current) {
  return function (data) {
    return (
      (data && Array.isArray(data.items) && data.items.length)
      ? <Branch { ...data } key={ data.url } path={ data.url } current={ current } />
      : <Leaf { ...data } key={ data.url } path={ data.url } isCurrent={ current === data.url} />
    );
  }
}

function Branch({ url, items, title, startClosed, path, current }) {
  const [closedState, setClosed] = React.useState(startClosed ? true : false);
  return (
    <li 
      className={ ` ${branch} ${closedState ? closed : '' } ` } 
      key={ url }>
      <div>
        <button
          onClick={ () => setClosed(!closedState) } 
          onKeyPress={ () => setClosed(!closedState) }>
          <i className="fas fa-caret-right" />
        </button>
        <Link className={ `${current === url ? highlighted : '' }` }to={ url }>{ title }</Link>
      </div>
      <ul>{ items.map(patternMatch(current)) }</ul>
    </li>
  );
}

function Leaf({ url, title, path, isCurrent }) {
  return (
    <li className={ `${isCurrent ? highlighted : ''}` } key={ url } >
      <Link to={ url }>{ title }</Link>
    </li>
  );
}
