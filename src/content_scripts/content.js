import makeInference from './inferencing';
import injectOverlay from './overlay';
import tt from '../helpers';

injectOverlay();
makeInference();


// this is example of how to do database query for content script
(async () => {
  let response = await browser.runtime.sendMessage({ type: 'queryDatabase', query: 'getTrackers', args: {} });
  tt.log(response);
})();