import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import gunRules from './gunRules';

import gunHelper from './gun/gunHelper';
gunHelper.appKey = "gun-calendar"
gunHelper.rules = gunRules;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

Function.prototype.debounce = function(wait) {
   let timeout,
       debouncedFunc = this;
   function debounceCore() {
      var context = this, args = arguments;
      function later() {
         timeout = null;
         debouncedFunc.apply(context, args);
      };
      cancel();
      timeout = setTimeout(later, wait);
   }
   function cancel() {
      clearTimeout(timeout);
   }
   debounceCore.cancel = cancel;
   return debounceCore;
};