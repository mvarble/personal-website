// import js stuff
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';

// import all of the markdown files
import pages from '../pages';

// render the app
ReactDOM.render(<App pages={ pages } />, document.getElementById('app'));
