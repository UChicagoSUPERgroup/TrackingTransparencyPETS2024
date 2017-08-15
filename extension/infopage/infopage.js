var port = browser.runtime.connect({name:"port-from-infopage"});

port.onMessage.addListener(m => {
  switch (m.type) {
    case "info_current_page":
      $('#pagetitle').text(m.info.title);
      $('#inference').text(m.info.inference);
      break;
    case "tracker_most_pages":
      $('#mosttrackername').text(m.trackerName);
      $('#mosttrackercount').text(m.count - 1);
      $('#mostrackerinferences').text(m.inferences.join(", "));
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

  // port.postMessage({ type: "request_info_current_page" });
  port.postMessage({ type: "get_tracker_most_pages" });

  $('.nav-link').click(function(){ console.log("hello"); });

}

$('document').ready(onReady());

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-more-btn")) {

    // document.getElementById("more").style.display = "inline";

  }
});

//New stuff below
