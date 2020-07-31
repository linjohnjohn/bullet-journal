import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
      <Router>

    <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// const initialWidth = window.innerWidth
let initialHeight = window.innerHeight

window.addEventListener('resize', () => {
  if (window.innerHeight > initialHeight) {
    initialHeight = window.innerHeight;
  }

  document.documentElement.style.setProperty('overflow', 'auto')
  const metaViewport = document.querySelector('meta[name=viewport]')
  metaViewport.setAttribute('content', `height= ${initialHeight}px, width=device-width, initial-scale=1.0`)
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
