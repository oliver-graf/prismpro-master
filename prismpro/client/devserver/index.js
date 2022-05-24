import React from 'react';
import ReactDOM from 'react-dom';
import App from '../src/App.jsx';

/**
 * Handle any hash changes and rerender.
 */
function handleNewHash() {
  const path = window.location.pathname;
  ReactDOM.render(<App path={ path }/>, document.getElementById('root'));
}

// Handle the initial route and browser navigation events
handleNewHash();
window.addEventListener('hashchange', handleNewHash, false);
