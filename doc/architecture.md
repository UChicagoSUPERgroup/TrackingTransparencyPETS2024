# Extension Architecture

See `diagram.pdf` for a diagram of this

WebExtensions are separated into a background script, which handles most of the extension's logic, a content script, which runs on each page, and web pages for the pop-up and exploration interface. Our background script additionally spawns multiple web workers (threads) to isolate the different components, preventing time-consuming operations such as database queries from slowing down the rest of the browser. The various components communicate using the WebExtensions messaging API's and web worker messaging. The architecture of our browser extension is described below:

- **Background script**
    - Web request interception
    - Uniquely identifies page loads
    - Relays messages between pop-up, dashboard and database worker
    - Relays messages between content script and inferencing worker
    - **Tracker worker**
        - Receives messages from background page
        - Sends messages to database worker
    - **Database worker**
        - Receives storage messages from background script, trackers worker, and inference worker, and writes to database
        - Receives and responds to query messages from pop-up and exploration page
    - **Inferencing worker**
        - Receives page content from content script
        - Infers ad interest category
- **Pop-up**
    - Provides short example of tracking in the user's browsing
    - Makes queries to database
- **Dashboard**
    - Provides interface to explore data collected
    - Makes queries to database
- **Content script**
    - Runs in the context of every webpage loaded
    - Extracts text from webpage
    - Sends webpage content to inferencing worker through background script