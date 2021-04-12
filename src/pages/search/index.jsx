import React from 'react';
import DatePicker from 'react-date-picker';
import fp from 'lodash/fp';

import QueryPosts from '../../components/query-posts';
import Head from '../../components/head';
import Navbar from '../../components/navbar';
import { searchForm } from './index.module.scss';

export default function Search({ location }) {
  // all of our search state functionality
  const [title, setTitle] = React.useState(undefined);
  const [dates, setDates] = React.useState([undefined, undefined]);
  const [tags, setTags] = React.useState([]);
  const [pendingTag, setPendingTag] = React.useState('');

  // perform a state update based off of location data
  React.useEffect(() => {
    setTitle(fp.get('title')(location.state));
    setDates(fp.get('dates')(location.state) || [undefined, undefined]);
    setTags(fp.get('tags')(location.state) || []);
  }, [location.state, setTitle, setDates, setTags]);

  // render accordingly
  return <>
    <Head title={ 'Search' } />
    <div>
      <Navbar />
      <div className="container">
        <div className="content">
          <div className="section">
            <h1>Search posts</h1>
            <div className={ searchForm }>
              <div>
                <TitleField title={ title } setTitle={ setTitle }/>
                <DateField 
                  label="Start date"
                  date={ dates[0] } 
                  setDate={ d => setDates(ds => [d, ds[1]]) }/>
                <DateField 
                  label="End date"
                  date={ dates[1] } 
                  setDate={ d => setDates(ds => [ds[0], d]) }/>
                <TagsField 
                  pendingTag={ pendingTag }
                  setPendingTag={ setPendingTag }
                  tags={ tags } 
                  setTags={ setTags } />
              </div>
              <QueryPosts 
                title={ title } 
                dates={ dates }
                tags={ tags }
                empty={ 
                  <div style={{ padding: '1em', border: '1px solid var(--grey)' }}>
                    No posts match your query
                  </div> 
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>;
}

function TitleField({ title, setTitle }) {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label" htmlFor="title">Title</label>
      </div>
      <div className="field-body">
        <div className="field">
          <p className="control">
            <input 
              name="title"
              className="input" 
              placeholder="Introduction to frames" 
              onChange={ e => setTitle(e.target.value) }
              value={ title }/>
          </p>
        </div>
      </div>
    </div>
  );
}

function DateField({ date, setDate, label }) {
  const labelShort = label.toLocaleLowerCase().split(' ').join('');
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label" htmlFor={ labelShort }>{ label }</label>
      </div>
      <div className="field-body">
        <div className="field">
          <p className="control">
            <DatePicker
              name={ labelShort }
              returnValue="start"
              format="y-MM-dd"
              yearPlaceholder="YYYY"
              monthPlaceholder="MM"
              dayPlaceholder="DD"
              onChange={ setDate }
              value={ date }/>
          </p>
        </div>
      </div>
    </div>
  );
}

function TagsField({ pendingTag, setPendingTag, tags, setTags }) {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label" htmlFor="tags">Tags</label>
      </div>
      <div className="field-body">
        <div className="field">
          <p className="control">
            <input
              name="tags"
              className="input"
              placeholder="rats, math, probability" 
              value={ pendingTag }
              onChange={ updateTags(setPendingTag, setTags) }
            />
            <div style={{ margin: '1em 0' }}>
              { 
                tags.map(tag => 
                  <TagField key={ tag } tag={ tag } setTags={ setTags }/>
                ) 
              }
            </div>
          </p>
        </div>
      </div>
    </div>
  );
}

function updateTags(setPendingTag, setTags) {
  return e => {
    const value = e.target.value;
    const commaIndex = value.indexOf(',');
    const spaceIndex = value.indexOf(' ');
    if (commaIndex === 0 || spaceIndex === 0) {
      setPendingTag('');
    } else if (commaIndex === -1 && spaceIndex === -1) {
      setPendingTag(value);
    } else {
      const endIndex = (
        commaIndex === -1
        ? spaceIndex
        : (spaceIndex === -1 ? commaIndex : Math.min(spaceIndex, commaIndex))
      );
      setPendingTag('');
      const tag = value.slice(0, endIndex);
      setTags(tags => tags.includes(tag) ? tags : [...tags, tag]);
    }
  }
}

function TagField({ tag, setTags }) {
  return (
    <span className="tag is-info" style={{ margin: '0.5em' }}>
      { tag }
      <button  // eslint-disable-line
        className="delete" 
        onClick={ () => setTags(tags => tags.filter(t => t !== tag)) } />
    </span>
  );
}
