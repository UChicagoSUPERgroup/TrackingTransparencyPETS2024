var port = browser.runtime.connect({name:"port-from-popup"});
port.postMessage({greeting: "hello from popup"});

port.onMessage.addListener(m => {
  switch (m.type) {
    case "info_current_page":
      $('#pagetitle').text(m.info.title);
      $('#inference').text(m.info.inference);
      break;
  }
});

async function onReady() {
  // let tabs = await browser.tabs.query({active: true, lastFocusedWindow: true})
  // let title = tabs[0].title;
  // if (title.length >= 30) {
  //   title = title.substring(0,30).concat("...");
  // }
  // $('#pagetitle').text(title);

  port.postMessage({ type: "request_info_current_page" });

}

$('document').ready(onReady());

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-more-btn")) {

    // document.getElementById("more").style.display = "inline";

  }
});

