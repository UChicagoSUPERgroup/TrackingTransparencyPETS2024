/* OVERLAY */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var overlay = document.createElement("div");
var p = document.createElement("p");
overlay.appendChild(p);
overlay.id = "tt_overlay_64f9de";

var line1 = document.createTextNode("3 third-parties");
var line2 = document.createTextNode("25 pages");

p.appendChild(line1);
p.appendChild(document.createElement('br'));
p.appendChild(line2);

document.body.appendChild(overlay);
