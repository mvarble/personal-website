import React from 'react';

import { content } from './index.module.scss';
import matthew from '../../assets/matthew.jpg'
import Samneric from '../components/samneric';
import TagBlock from '../components/tag-block';
import QueryPosts from '../components/query-posts';
import Head from '../components/head';
import Navbar from '../components/navbar';

import { Link } from 'gatsby';

export default function Home() {
  return <>
    <Head title={ 'Home' } />
    <Navbar />
    <div className="is-marginless is-paddingless">
      <div className="section">
        <div className="columns">
          <div className="column is-two-thirds-widescreen is-full-desktop" style={{ margin: '0 auto' }}>
            <div className="content">
              <div className={ content }>
                <div>
                  <h1>Howdy!</h1>
                  <p>
                    My name is Matthew Varble <span role="img" aria-label="cowboy">🤠</span>.
                    I am a mathematics PhD student at UCSB researching probability theory.
                    Broadly speaking, I am interested in stochastic processes and numerical analysis.
                    There is just something about combining mathematics and software engineering!
                  </p>
                  <p>
                    This site serves as a blog for me to share things that interest me in both my academic and personal life.
                    For instance, you might read about my two brother rats!
                  </p>
                  <Samneric />
                </div>
                <img src={ matthew } width={ 200 } alt="matthew"/>
              </div>
              <p>
                I will also likely talk about math/programming problems that excite me.
                Ideally, I will also write sequences of posts that build up an understanding of my favorite concepts in probability theory.
                To explore my site, either feel free to search on the titlebar, use the word map of tags I commonly use:
              </p>
              <TagBlock />
              <p>
                or simply look at the most recent posts!
              </p>
              <div style={{ margin: '1em 0', padding: '1em' }}>
                <QueryPosts take={ 5 } />
                <Link to="/search">
                  <div 
                    className="button is-info is-size-4" 
                    style={{ 
                      display: 'block',
                      borderRadius: 0,
                      borderTop: 'none', 
                    }}>
                  More! <span role="img" aria-label="yay!">🤗</span>
                  </div>
                </Link>
              </div>
              <p>
                You may also be interested in my <a href="https://github.com/mvarble">GitHub account</a> or a website of <a href="https://presentations.rat.supply">presentations I have given</a>.
              </p>
              <p>
                Whatever the case is, I hope you enjoy my site and we get to know one another!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>;
}
