/* Google Inference AdsSettings Grabber */


export default function getGoogleInferences (pageId) {

	console.log("[+] scraping google ad settings directly" + pageId)

	const inferences = new Array();
	// this is redundant, fix later

	const info = new Array()

	var outer_outer = document.getElementsByClassName("JRGAPc");  //JRGAPc

	for(var i = 0;i < outer_outer.length; i++){

	  // console.log(outer_outer[i])
	  let subs = outer_outer[i].getElementsByTagName('*');

	  let key; 
	  let value;

	  for (var q = 0; q < subs.length; q++) {
	    // console.log(subs[q])

	    if (subs[q].className == 'lSvC9c ') {
	      // this is an interest or demographic //console.log(subs[q].src.split('/')[6])
	      key = "-"
	    } else if (subs[q].className.includes('lSvC9c')) {
	      key = "interest - company"
	    } if (subs[q].className == 'c7O9k') {
	      value = subs[q].textContent
	    }

	    if (value !== undefined && key !== undefined) {

	      var entry = new Object();
	      entry = {
	      	"type": key,
	      	"value": value,
	      }
	      // entry[key] = value
	      // alert(entry)
	      info.push(entry)
	    }

	  }
	}

	chrome.runtime.sendMessage({ type: 'google_inference_done', article: info, pageId: pageId });


}




