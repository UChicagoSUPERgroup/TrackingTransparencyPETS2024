/** @module default for logging */


async function setLoggingDefault() {
  let usageStatCondition;
  usageStatCondition = 'true';//switch for the sending data

  await browser.storage.local.set({usageStatCondition});
  return usageStatCondition;
}

export default {setLoggingDefault};
