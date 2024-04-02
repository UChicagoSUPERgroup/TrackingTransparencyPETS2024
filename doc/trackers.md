# Tracker Detection

In order to detect trackers, we log all outgoing web requests, which includes requests to advertisements and trackers, and then check if the request is for a tracker by checking the request URL against an open-source list of trackers compiled by Disconnect, a company that makes a similar browser extension. If a request is for a known tracker domain, we store a record in the database with the tracker domain and a unique identifier for the page that the request originated from.

To minimize our impact on browser performance, we have structured our extension to do as little work as possible for each request. We use web workers, which are a way to create multiple threads in JavaScript, to isolate the tracker detection logic from the rest of the extension, which prevents time consuming operations such as searching the tracker list from slowing down other portions of the browser. A record of each web request is sent to the trackers web worker, which then stores the requests in a queue to be processed when convenient. Periodically, the trackers worker processes the queue, checking the domain of each request against the Disconnect list; if the request is for a known tracker, a message is sent to another web worker that handles the database, which has methods to write a new database row when an appropriate message is received.

For more information on trackers, see `background/trackers` for the tracker worker. 



