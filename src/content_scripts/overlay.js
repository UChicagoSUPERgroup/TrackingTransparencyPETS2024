import '../styles/overlay.css';

export default class Overlay {

  constructor() {

    let overlay = document.createElement('div');
    this.overlay = overlay;
    overlay.id = 'trackingtransparency_overlay';
    overlay.innerHTML += '<div class="tt_closebutton"></div>'

    this.addTabData();

    // hack to get trackers to update to final value after 5 sec
    setInterval(() => {
      chrome.runtime.sendMessage({ type: 'getTabData' });
    }, 3000)
  }

  inject() {
    document.body.appendChild(this.overlay);
    this.overlay.onclick = (() => {
      this.overlay.parentElement.removeChild(this.overlay);
    });
  }

  append(append) {
    this.overlay.innerHTML += append;
  }

  remove() {
    this.overlay.parentElement.removeChild(this.overlay);
  }

  addTabData() {
    // note that we are using the CHROME api and not the BROWSER api
    // because the webextension polyfill does NOT work with sending a response because of reasons
    // so we have to use callbacks :(
    chrome.runtime.sendMessage({ type: 'getTabData' }, (tabData) => {
      if (!tabData) {
        throw new Error('no tab data');
      }

      if (tabData.trackers.length > 0) {
        this.append('<strong>' + tabData.trackers[0] + '</strong> and <span id="num-trackers">' + (tabData.trackers.length - 1) + '</span> others are tracking you.');
      } else {
        this.append('There are no trackers on this page!');
      }
    });
  }

  addInference(inference) {
    this.append('<br/><br/>We think this page is about <strong>' + inference + '</strong>');
  }

  updateTrackers(trackers) {
    console.log('now have', trackers.length, 'trackers')
    document.getElementById('num-trackers').textContent = trackers.length - 1;
  }
}
