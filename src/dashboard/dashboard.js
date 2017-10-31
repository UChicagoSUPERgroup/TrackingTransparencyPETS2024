'use strict';

import FrontendMessenger from '../frontendmessenger.js';

import React from 'react';
import ReactDOM from 'react-dom';

const port = browser.runtime.connect({name:"port-from-dashboard"});
const frontendmessenger = new FrontendMessenger("dashboard", port);

port.onMessage.addListener(frontendmessenger.messageListener);

ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('root')
);