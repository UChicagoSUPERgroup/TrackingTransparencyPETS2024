var port = browser.runtime.connect({name:"port-from-popup"});
port.postMessage({greeting: "hello from popup"});

port.onMessage.addListener(m => {
  switch (m.type) {
    case "inference_current_page":
      $('#inference').text(m.inference);
  }
});

async function onReady() {
  let tabs = await browser.tabs.query({active: true, lastFocusedWindow: true})
  let title = tabs[0].title;
  if (title.length >= 30) {
    title = title.substring(0,30).concat("...");
  }
  $('#pagetitle').text(title);

  port.postMessage({ type: "request_inference_current_page" });


}

$('document').ready(onReady());

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-more-btn")) {

    // document.getElementById("more").style.display = "inline";

  }
});

