async function onReady() {
  let tabs = await browser.tabs.query({active: true, lastFocusedWindow: true})
  let title = tabs[0].title;
  if (title.length >= 30) {
    title = title.substring(0,30).concat("...");
  }
  $('#tt_hook_origin_title').text(title);
}

$('document').ready(onReady());

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-more-btn")) {

    // document.getElementById("more").style.display = "inline";

  }
});