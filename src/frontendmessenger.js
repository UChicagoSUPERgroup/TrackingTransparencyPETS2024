'use strict';

export default class FrontendMessenger {

  constructor(context) {
    this.context = context;
    this.pendingQueries = {};
    this.queryId = 0;

    const portName = "port-from-" + context;
    this.port = browser.runtime.connect({name: portName});

    this.messageListener = this.messageListener.bind(this);
    this.queryDatabase = this.queryDatabase.bind(this);
    this.getTabData = this.getTabData.bind(this);

    this.port.onMessage.addListener(this.messageListener);
  }
    
  messageListener(m) {
    switch (m.type) {
      case "tab_data_response":
        this.pendingQueries[m.id](m.response);
        break;

      case "database_query_response":
        // resolve pending query promise
        this.pendingQueries[m.id](m.response);
        break;
    }
  }
  
  async queryDatabase(query,args) {
      let queryPromise = new Promise((resolve, reject) => {
          this.pendingQueries[this.queryId] = resolve;
      })
      // pendingQueries[queryId].promise = queryPromise;
      const msg = {
        type: "database_query",
        src: this.context,
        id: this.queryId,
        query: query,
        args: args
      };
      console.log("frontendmessenger sending database query msg", msg);
        
      this.port.postMessage(msg);
      this.queryId++;

      let res = await queryPromise;
      console.log("frontendmessenger recv query result", res);
      return res;
  }

  async getTabData(tabId) {
    let queryPromise = new Promise((resolve, reject) => {
        this.pendingQueries[this.queryId] = resolve;
    })

    this.port.postMessage({
      type: "get_tab_data",
      src: this.context,
      id: this.queryId,
      tabId: tabId
    });

    this.queryId++;

    let res = await queryPromise;
    return res;
  }
}