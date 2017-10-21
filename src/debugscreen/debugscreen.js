import FrontendMessenger from '../frontendmessenger.js';

import $ from 'jquery';
window.jQuery = $;

const frontendmessenger = new FrontendMessenger("debugscreen");

async function saveOptions(e) {
  e.preventDefault();
  let select = document.getElementById("queryName");
  let queryName = select.options[select.selectedIndex].text;

  let argsObject = {
    domain: document.querySelector("#domain").value,
    tracker: document.querySelector("#tracker").value,
    inference: document.querySelector("#inference").value,
    count: +document.querySelector("#count").value,
    inferenceCount: +document.querySelector("#inferenceCount").value,
    pageCount: +document.querySelector("#pageCount").value,
  }
  console.log(queryName, argsObject);

  let query = await frontendmessenger.queryDatabase(queryName, argsObject);
  console.log(query);

  document.getElementById("queryResult").textContent = JSON.stringify(query, null, 4);
}

document.querySelector("form").addEventListener("submit", saveOptions);


document.addEventListener("click", (e) => {
  const clickTarget = e.target

  if (clickTarget.classList[0]=="nav-link" && clickTarget.href.includes("#")) {
    const chosenContent = clickTarget.href.split("#")[1];
    switch(chosenContent) {
      case "who-is-tracking":
        break;
    }
  }
});
