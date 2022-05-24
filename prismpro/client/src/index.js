import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

/**
 * Handle any hash changes and rerender.
 */
function handleNewHash() {
  const path = window.location.pathname;
  // eslint-disable-next-line react/jsx-filename-extension
  ReactDOM.render(<App path={ path } />, document.getElementById('root'));
}

// Handle the initial route and browser navigation events
handleNewHash();
window.addEventListener('hashchange', handleNewHash, false);
