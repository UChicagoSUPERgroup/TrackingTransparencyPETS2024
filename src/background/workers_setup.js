/* web workers setup */
const trackersWorker = new Worker('/dist/trackers_worker.js');
const databaseWorker = new Worker('/dist/database_worker.js');
const inferencingWorker = new Worker('/dist/inferencing_worker.js');

/* connect database worker and trackers worker */
/* this involves creating a MessageChannel and passing a message with
 * the channel to each worker */
const trackerDatabaseChannel = new MessageChannel();
trackersWorker.postMessage({type: 'database_worker_port', port: trackerDatabaseChannel.port1}, [trackerDatabaseChannel.port1]);
databaseWorker.postMessage({type: 'trackers_worker_port', port: trackerDatabaseChannel.port2}, [trackerDatabaseChannel.port2]);

/* connect database worker and inferencing worker */
const inferencingDatabaseChannel = new MessageChannel();
inferencingWorker.postMessage({type: 'database_worker_port', port: inferencingDatabaseChannel.port1}, [inferencingDatabaseChannel.port1]);
databaseWorker.postMessage({type: 'inferencing_worker_port', port: inferencingDatabaseChannel.port2}, [inferencingDatabaseChannel.port2]);

export {trackersWorker, databaseWorker, inferencingWorker};
