function urlName(string) {
  return string.toLowerCase().replace(/[^a-z0-9]+/g,'-');;
}

function cleanName(string) {
  return string.toLowerCase().replace(/[^a-z0-9]+/g,' ');;
}

function cleanScriptName(string) {
  return string.replace(/_/g,' ');;
}

export default {urlName, cleanName, cleanScriptName};