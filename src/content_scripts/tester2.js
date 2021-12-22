const tldjs = require('tldjs');
import Pattern from 'url-knife';



chrome.storage.local.get(['href_blocklist'], function(result) {
    let known_set = new Set(result.href_blocklist)

    let possible_explanations = []
    let ad_server_links = []
    let adClick = []
    document.querySelectorAll('*').forEach(function(node) { 

        if (String(node.innerHTML).includes("href")) {

            let start = (new Date()).getTime() / 1000;
            var all_links = node.getElementsByTagName('a')
            let is_ad_server = false
            for (let entry of all_links) {                
                let target = entry.href
                let target_info = tldjs.parse(target)
                let target_hostname = target_info.hostname
                let target_subdomain = target_info.subdomain
                let target_domain = target_info.domain

                if (target_hostname != null && (known_set.has(target_domain) || known_set.has(target_hostname))) {
                    // timing check for alternative methods
                    if (target.includes('privacy.us.criteo.com/adchoices')) {
                        // this is a link to the ad explanation
                        // the caller here is actually the right href 
                        if (!ad_server_links.includes(String(window.location.href))) {
                            ad_server_links.push(String(window.location.href))
                        }
                    }
                    else if (!ad_server_links.includes(target)) {
                        ad_server_links.push(target)
                    }
                }

                // criteo or whyThisAd
                if (entry.href.includes('privacy.us.criteo.com/adchoices') || entry.href.includes('/whythisad')) {
                    if (!possible_explanations.includes(entry.href)) {
                        possible_explanations.push(entry.href);
                    }
                    
                }

            }


        }

    })

    if (ad_server_links.length != 0 || adClick.length != 0) {
        console.log("=== end result of loop ===")
        console.log("explanations  " + JSON.stringify(possible_explanations))
        console.log("ad server links  " + JSON.stringify(ad_server_links))
        console.log('adclick.g.  ' + JSON.stringify(adClick))


        let ad_information3 = new Object()
        var markup = document.documentElement.innerHTML;
        ad_information3.DOM = markup;
        ad_information3.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        ad_information3.called_by = String(window.location.href) + "..." + String(window.inititalized)
        if (possible_explanations.length != 0) {
            ad_information3.ad_explanation = possible_explanations[0]
        }
        if (ad_server_links.length != 0) {
            ad_information3.ad_landing_page_long = ad_server_links[0]
        }

        chrome.runtime.sendMessage({ type: 'page_ads', article: ad_information3 });
    }



});









