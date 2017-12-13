const debug = true;

function log(str) {
  if (debug) {
    console.log(str);
  }
}

function enoughData() {
  return true;
}

export default {log, enoughData};