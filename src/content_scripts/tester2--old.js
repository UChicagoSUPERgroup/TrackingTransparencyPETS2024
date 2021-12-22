/* AD SCRAPING */

// export default function getAdDOM () {

// 	var temp = String(document.documentElement.innerHTML).substring(0,100);
// 	// console.log("========== " + temp + "========== ")
// }









// console.log(document);
// var parser = new DOMParser();
// var htmlDoc = parser.parseFromString(frameContent, 'text/html');
// alert(document);
// var markup = document.documentElement.innerHTML;


// console.log(markup)

//////////////////////////////////////////////////////////////////////////////////////// THEN USE HTML2CANVAS to grab just this html
// html2canvas(document.body).then(function(canvas) {
//     document.body.appendChild(canvas);
// });
// var wnd = window.open("about:blank", "", "_blank");
// wnd.document.write(markup);


// const allElements = document.querySelectorAll('*');
// for (var i = 0; i < allElements.length; i++) {
// 	var classes = allElements[i].className.toString().split(/\s+/);
// 	if (classes.includes("ad-stickyhero")) {
// 		console.log("==============================================" + "START" + "===========================================")
// 		console.log(allElements[i])
// 		var temp = allElements[i]
// 		console.log(temp.innerHTML)
// 		var test = temp.getElementsByTagName("iframe");
// 		console.log(test)
// 		console.log(test.innerHTML)
// 		console.log("==============================================" + "END" + "===========================================")


// 	}
// }


// // this loads for every page (iframes within pages are loaded separately)
// console.log("sanity check, that we've loaded this, as called by  --  " + window.location.href)




// export default function getAdDOM2 () {




// const ad_information = new Object();



//////////////////////////////////////// trying to get the google_ads_iframe which everything is wrapped in, but it is usually hidden ==> same, other technique
// this is good because we have control over when it is called (only one time)
// but it doesn't actually grab the lower-level information that we need

// function process_node(node) {
//     // console.log(node.id);
//     // console.log(node.childNodes.length)
//     // console.log(node.getElementsByTagName("iframe"))
//     console.log(node)

//     var iframe = node.querySelector("iframe");
//     console.log(iframe)

//     // i can get div-gpt but not lower into iframe???? maybe just get links from here like before???
    
//     // if (node.childNodes.length > 0) {
//     // 	console.log(node.childNodes)
//     // }

// }
// function visit_nodes_recursive(callback, node) {
//     node = node || document;
//     callback.call(null, node);

//     if (node.firstChild)
//         visit_nodes_recursive(callback, node.firstChild);

//     if (node.nextSibling)
//         visit_nodes_recursive(callback, node.nextSibling);

// }

// visit_nodes_recursive(process_node);




//////////////////////////////////////// trying to get the google_ads_iframe which everything is wrapped in, but it is usually hidden
// function allDescendants (node) {
//     for (var i = 0; i < node.childNodes.length; i++) {
//       var child = node.childNodes[i];
//       allDescendants(child);
//       if (String(child.innerHTML).includes("google_ads_iframe")) {
//       	console.log(child)
//       	console.log("pizzzzza")
//       	var markup = child.innerHTML;
//       	console.log(markup)
//       }
//       // console.log(child)
//     }
// }

// allDescendants(document)




//////////////////////////////////////// trying to get the google_ads_iframe which everything is wrapped in, but it is usually hidden ==> same
// document.querySelectorAll('*').forEach(function(node) {

//     // console.log(node)

//     allDescendants(node)



//     // let children = node.childNodes
//     // console.log(children.length)
//     // children_count = children.length 
//     // while (children_count != 0) {
//     // 	children.forEach(function(item) {
//     // 		children = 
//     // 	})
//     // }

//     // children.forEach(function(item){
//     //     // console.log(item);
//     //     // console.log(item.id)
//     //     let id = item.id 
//     //     // console.log(id)
//     //     if (String(id) !== "undefined") {
//     //     	if (String(id).includes("google_ads_iframe")) {
//     //     		console.log("=======================================")
//     //     		console.log(item)
//     //     		console.log("=======================================")
//     //     	}
//     //     }
//     //     // if (item.id.includes('google_ads_iframe')) {
//     //     // 	console.log(item)
//     //     // }
//     // });

//     // allDescendants(node)
//     // console.log(node.tagName)
//     // if (String(node.tagName) == "BODY") {
//     // 	console.log(node)
//     // }
// });















/////////////////// CONSIDER THIS A SINGLE IFRAME ///////////////////


console.log(String(window.location.href))

const ad_information = new Object();


//////////////////////////////// level 1 ==> look at all hyperlinks and check if any are from adServers
let level1 = false


const elements = document.querySelectorAll('a:link:not([href^=javascript])');
// console.log(elements)

const links = new Array(elements.length);
if (links.length >= 1) {

	// get all hyperlinks 
	for (let i = 0; i < elements.length; i++) {

		links[i] = {
			hash: elements[i].hash,
			host: elements[i].host,
			hostname: elements[i].hostname,
			href: elements[i].href,
			origin: elements[i].origin,		// initiator
			pathname: elements[i].pathname,
			search: elements[i].search,
			text: elements[i].text,
			};

	}

	// console.log(links)
	// *** this should be the same ad, so grabbing both ad href and ad explanation in for loop should be for same one *** //
	// 1. whythisad is the ad explanation 
	// 2. pagead or doubleclick is the href outer link
	for (let i = 0; i < links.length; i++) {
		
		console.log(links[i].href)

		if (links[i].pathname === '/whythisad') {
			ad_information.ad_explanation = links[i].href
			ad_information.initiator = links[i].origin
			// console.log("******************************** adsettings" + i + " -- " + JSON.stringify(links[i]))
			

		}
		// these are outbound links, so the ad provider serves the ad, but then there are a lot of links within that ad too, we need to parse these and get the right one
		if (links[i].href.includes('adclick') || links[i].href.includes('googleadservices') || links[i].href.includes('s0.2mdn.net') || links[i].href.includes('doubleclick') || links[i].href.includes('googlesyndication') || links[i].href.includes('ssp.yahoo.com') || links[i].href.includes("iad-usadmm.dotomi")) {

			console.log("******************************** server catch" + i + " caller " + String(window.location.href) + " -- " + links[i].href)

			// console.log("HERE IS THE AD FROM THE AD PROVIDER")
			// console.log(links[i])
			ad_information.ad = links[i].href
			ad_information.initiator = links[i].origin


			// // only works for some
			// let ad_landing_page_encoded = links[i].href.split('&adurl=')[1]; 
			// let ad_landing_page = decodeURIComponent(ad_landing_page_encoded);
			// ad_information.ad_landing_page_long = ad_landing_page;
			ad_information.ad_landing_page_long = links[i].href


			var markup = document.documentElement.innerHTML;
			ad_information.DOM = markup;
			console.log(ad_information + i)

			// for debugging 
			ad_information.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
			ad_information.called_by = String(window.location.href) + "..." + String(window.inititalized)

			// turn back to true for not crazy debugging
			level1 = false

			// where I grabbed you
			ad_information.trigger = "href includes"

		}

	}

}

//////////////////////////////// level 2 ==> less common ad behaviors 
if (level1 == false) {
	let level2 = false
	console.log("\n\n\n LEVEL 2 \n\n\n")

	// wrapping adURL inside json
	var markup = document.documentElement.innerHTML;
	// console.log(markup)
	document.querySelectorAll('*').forEach(function(node) { 
		
		// really deep debuggin
		console.log(node.innerHTML)

		//// experimental 
		if (String(node.innerHTML).includes("clickurl") || String(node.innerHTML).includes("clickTag")) {
			console.log("pizza")
			console.log(node)
		}
		
		if (String(node.innerHTML).includes("adclick.g.")) {

			try {

				// console.log(node)
				console.log(ad_information)
				console.log(node.href + " -- pizza")
				var start = node.innerHTML.indexOf("https://adclick.g.doubleclick.net/pcs/click?");
				if (start !== -1) {
					// console.log(start)
					// console.log(node.innerHTML.substring(0, start))
					let rest_of_string = node.innerHTML.substring(start, node.innerHTML.length)
					var stop = rest_of_string.indexOf('"');
					// console.log(stop)
					stop = stop + start //because it only looked at substring
					// console.log(stop)
					// console.log(node.innerHTML.substring(start, stop))
					// console.log(node.innerHTML)

					ad_information.ad_landing_page_long = node.innerHTML.substring(start, stop)
					ad_information.DOM = markup;
					ad_information.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
					ad_information.called_by = String(window.location.href) + "..." + String(window.inititalized)

					// where I grabbed you
					ad_information.trigger = "adclick.g. regex on clickable link"
					
				}


			} catch (err) {
				console.log(err)
			}
			
		}

		if (node.innerHTML.includes("https://www.googleadservices.com/pagead/aclk?")) {
			// console.log(node)
			// console.log(node.innerHTML)
			try {
				var data = JSON.parse(node.textContent);
				console.log(data)
				console.log(data["targets"]["redirectUrl"]['finalUrl'])
				// console.log(data["targets"]["redirectUrl"]['trackingUrls'])
				console.log(JSON.stringify(ad_information))
				ad_information.ad_landing_page_long = data["targets"]["redirectUrl"]['finalUrl']
				ad_information.DOM = markup;
				ad_information.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
				ad_information.called_by = String(window.location.href) + "..." + String(window.inititalized)

				// where I grabbed you
				ad_information.trigger = "googleadservices json parse"

			} catch (err) {
				console.log(err);
			}

			// experimental 
			// try {
			// 	console.log("(((((((((((((((((((((((((((((((((((()))))))))))))))))))))))))))))))))))))))))))")
			// 	console.log(node)
			// 	console.log(node.innerHTML)
			// 	var data = JSON.parse(node.textContent);
			// 	console.log(data)
			// 	console.log(data['adData'])
			// 	console.log(data['google_click_url'])
			// 	// var data = JSON.parse(node.textContent);
			// 	// console.log(data)
			// 	// console.log(data["google_click_url"])
			// 	// // console.log(data["targets"]["redirectUrl"]['trackingUrls'])
			// 	// console.log(JSON.stringify(ad_information))
			// 	// ad_information.ad_landing_page_long = data["targets"]["redirectUrl"]['finalUrl']
			// 	// ad_information.DOM = markup;
			// 	// ad_information.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
			// 	// ad_information.called_by = String(window.location.href) + "..." + String(window.inititalized)
			// } catch (err) {
			// 	console.log(err);
			// }

		

			

			
		}
		
	})

}


//////////////////////////////// closeout, check if you have the needed information from this iframe
var ad_length = Object.keys(ad_information).length

if (ad_length >= 4) { // everything but ad explanation url is captured with 4
	chrome.runtime.sendMessage({ type: 'page_ads', article: ad_information });
}



// }










