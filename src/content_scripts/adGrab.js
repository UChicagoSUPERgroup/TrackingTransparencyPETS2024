const tldjs = require('tldjs');
import Pattern from 'url-knife';
const axios = require('axios')

var ifvisible = require('ifvisible');

let DEBUG = false

let analyzed_this_url = new Set()


var title_to_send;
try {
    title_to_send = String(document.getElementsByTagName("title")[0].textContent.replace(/(\r\n|\n|\r)/gm," "))
} catch (e) {
    title_to_send = ''
}

ifvisible.setIdleDuration(30);
ifvisible.on('statusChanged', function(e){
    if (title_to_send != undefined) {
        chrome.runtime.sendMessage({ type: 'adGrabber', article: {"type": e.status, "title": title_to_send, 'more': JSON.stringify(e)} });
    }
});

chrome.storage.local.get(['href_blocklist'], function(result) {
    let known_set = new Set(result.href_blocklist)

    let possible_explanations = []
    let ad_server_links = []
    let adClick = []

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // google search ads specifically 
    //////////////////////////////////////////////////////////////////////////////////////////////////
    if (window.location.href.includes('google.com/search')) {
        let all_ads_regular_ads_top_banner = document.querySelectorAll('[data-pcu]')
        let all_ads_top_carousel_ads__opt1 = document.getElementsByClassName('mnr-c pla-unit')  
        let all_ads_top_carousel_ads__opt2 = document.getElementsByClassName('Mckyte')     //mnr-c pla-unit ... Mckyte
        let regular_ads_set = new Set()
        for (let entry of all_ads_regular_ads_top_banner) {
            let direct_link = entry.querySelectorAll('[data-dtld]')[0].innerText
            let text_title_collection = entry.getElementsByClassName('CCgQ5 vCa9Yd QfkTvb MUxGbd v0nnCb')[0].innerText
            let hostname_mod = "https://" + tldjs.parse(entry.href).hostname
            regular_ads_set.add("https://www.googleadservices.com/pagead/customADDIN--googleSearch_inPageAds--/" + "/aria-label=" + encodeURI(text_title_collection) + "/" + direct_link)
        }

        let carousel_ads_set = new Set()
        for (let entry of all_ads_top_carousel_ads__opt2) {
            const childern = entry.childNodes;
            childern.forEach(node => {
                if (node.getAttribute('style') != "display:none") {
                    let nodeChild = node.firstChild
                    if (nodeChild.href != undefined) {
                        let hostname_mod = "https://" + tldjs.parse(nodeChild.href).hostname
                        carousel_ads_set.add("https://www.googleadservices.com/pagead/customADDIN--googleSearchCarouselAds--/"  + "/aria-label=" + encodeURI(nodeChild.getElementsByClassName('bXPcId pymv4e eAF8mc')[0].innerText) + "/finalpiece/" +  nodeChild.href)
                        return false
                    }

                }
                
            });
        }

        let carousel_ads_set2 = new Set()
        let entry = all_ads_top_carousel_ads__opt1
        for (var i = 0; i < entry.length; i++) { 
            try {
                carousel_ads_set2.add("https://www.googleadservices.com/pagead/customADDIN--googleSearchCarouselAds--/"  + "/aria-label=" + encodeURI(entry[i].children[1].children[0].getAttribute('aria-label')) + "/finalpiece/" +  entry[i].children[1].children[0].href)
            } catch (error) {
                console.log(error)
            }
        }


        if (DEBUG) {
            console.log(regular_ads_set)
            console.log(carousel_ads_set)
        }


        if (regular_ads_set.size > 0) {
            // console.log(">>>>>>>>>>>>>>>>>>>>>REGULAR ads")
            for (let ad of regular_ads_set) {
                let ad_information3 = new Object()
                var markup = document.documentElement.innerHTML;
                ad_information3.DOM = markup;
                ad_information3.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                ad_information3.called_by = String(window.location.href) + "..." + String(window.inititalized)
                ad_information3.ad_landing_page_long = ad
                ad_information3.all_links_packaged = [];
                chrome.runtime.sendMessage({ type: 'page_ads', article: ad_information3 });
            }
        }
        if (carousel_ads_set.size > 0) {
            // console.log(">>>>>>>>>>>>>>>>>>>>>SET carousel")
            for (let ad of carousel_ads_set) {
                let ad_information3 = new Object()
                var markup = document.documentElement.innerHTML;
                ad_information3.DOM = markup;
                ad_information3.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                ad_information3.called_by = String(window.location.href) + "..." + String(window.inititalized)
                var full_url = ad
                ad_information3.ad_landing_page_long = full_url.split("/finalpiece/").pop() 
                // console.log(ad_information3.ad_landing_page_long)
                ad_information3.all_links_packaged = [];
                chrome.runtime.sendMessage({ type: 'page_ads', article: ad_information3 });
            }
        }
        if (carousel_ads_set2.size > 0) {
            // console.log(">>>>>>>>>>>>>>>>>>>>>SET2 carousel")
            for (let ad of carousel_ads_set2) {
                let ad_information3 = new Object()
                var markup = document.documentElement.innerHTML;
                ad_information3.DOM = markup;
                ad_information3.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                ad_information3.called_by = String(window.location.href) + "..." + String(window.inititalized)
                var full_url = ad
                ad_information3.ad_landing_page_long = full_url.split("/finalpiece/").pop() 
                // console.log(ad_information3.ad_landing_page_long)
                ad_information3.all_links_packaged = [];
                chrome.runtime.sendMessage({ type: 'page_ads', article: ad_information3 });
            }
        }



    } else {
    //////////////////////////////////////////////////////////////////////////////////////////////////
    // ads everywhere else 
    //////////////////////////////////////////////////////////////////////////////////////////////////

        document.querySelectorAll('*').forEach(function(node) { 

            if (DEBUG) console.log(String(node.innerHTML))


            // custom grab for afcdn ads (image source style)
            if (String(node.innerHTML).includes("afcdn.net")) {
                var possible_ads = node.querySelectorAll('[src]')
                for (let entry of possible_ads) {   
                    let link_out_ad = entry.src
                    if (link_out_ad.includes('afcdn.net')) {
                        let target = link_out_ad
                        ad_server_links.push(target)

                    }
                }
            }

            if (String(node.innerHTML).includes("href")) {
                if (String(node.innerHTML).includes("adclick.g.") || String(node.innerHTML).includes("g.doubleclick")) {
                    if (DEBUG) console.log(node)
                    try {
                        var noscript = document.getElementsByTagName('noscript')[0]

                        var div = document.createElement('div');
                        div.innerHTML = noscript.textContent;
                        var links = div.getElementsByTagName("a")
                        for (let entry of links) {
                            
                            let target = entry.href
                            let target_info = tldjs.parse(target)
                            let target_hostname = target_info.hostname
                            let target_subdomain = target_info.subdomain
                            let target_domain = target_info.domain
                            ad_server_links.push(target)

                            // criteo or whyThisAd
                            if (entry.href.includes('privacy.us.criteo.com/adchoices') || entry.href.includes('/whythisad')) {
                                if (!possible_explanations.includes(entry.href)) {
                                    possible_explanations.push(entry.href);
                                }
                                
                            }

                        }

                    } catch (e) {
                        // console.log("can't grab, likely failure on noScript")
                        // console.log(document.getElementsByTagName('noscript')[0])
                        // get googleadservices link href 

                    }
                    
                }


                //////////////////////////////////////////////////////////////////////////////////////////////////
                // general ad grabbing by outgoing href 
                //////////////////////////////////////////////////////////////////////////////////////////////////

                var all_links = node.getElementsByTagName('a')
                let is_ad_server = false
                for (let entry of all_links) {                
                    let target = entry.href

                    // make sure we have not already investigated this outgoing link 
                    if (analyzed_this_url.has(target) == false) {
                        analyzed_this_url.add(target)
                        let target_info = tldjs.parse(target)
                        let target_hostname = target_info.hostname
                        let target_subdomain = target_info.subdomain
                        let target_domain = target_info.domain
                        let parsed_URI; 
                        try {
                            parsed_URI = Pattern.UrlArea.normalizeUrl(target).onlyUri
                        }
                        catch (e) {
                            parsed_URI = ''
                        } 



                        if (target_hostname != null && (known_set.has(target_domain) || known_set.has(target_hostname) || known_set.has(parsed_URI))) {
                            
                            // console.log("target" + target)
                            // console.log("hostname " + target_hostname)
                            // console.log("set has hostname" + known_set.has(target_hostname))
                            // console.log("domain " + target_domain)
                            // console.log("set has target" + known_set.has(target))
                            // console.log('parsed uri' + parsed_URI)
                            // // // let parsed_URI = Pattern.UrlArea.normalizeUrl(target).onlyUri
                            // console.log("set has parsed URI" + known_set.has(parsed_URI))

                            if (target.includes('privacy.us.criteo.com/adchoices')) {
                                // this is a link to the ad explanation
                                // the caller here is actually the right href 
                                // console.log("Pizza criteo")
                                console.log("criteo: " + target)
                                if (!ad_server_links.includes(String(window.location.href))) {
                                    ad_server_links.push(String(window.location.href))
                                }
                            }
                            else if (!ad_server_links.includes(target) && !target.includes("outbrain.com")) {
                                // console.log(target)
                                // console.log(entry)
                                // console.log(document.querySelector('[href="' + target + '"]'))
                                // console.log(node)
                                // console.log("notoutbrain: " + target)
                                ad_server_links.push(target)
                                // ad_server_links.push('https://' + target_hostname)
                                // ad_server_links.push('https://' + target_subdomain)
                            }

                            else {
                                console.log("fallback: " + target)
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


            }


        })

    }

    

    if (ad_server_links.length != 0 || adClick.length != 0) {
        if (DEBUG) console.log("=== TrTr ad grabber ===")
        if (DEBUG) console.log("explanations  " + JSON.stringify(possible_explanations))
        if (DEBUG) console.log("ad server links  " + JSON.stringify(ad_server_links))
        if (DEBUG) console.log('adclick.g.  ' + JSON.stringify(adClick))

        for (let item of ad_server_links) {
            if (DEBUG) console.log(item)
        }

        let ad_information3 = new Object()
        var markup = document.documentElement.innerHTML;
        ad_information3.DOM = markup;
        ad_information3.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        ad_information3.called_by = String(window.location.href) + "..." + String(window.inititalized)
        if (DEBUG) console.log(ad_information3)
        if (possible_explanations.length != 0) {
            ad_information3.ad_explanation = possible_explanations[0]
        }
        if (ad_server_links.length != 0) {
            ad_information3.ad_landing_page_long = ad_server_links[0]
        }

        ad_information3.all_links_packaged = [...new Set(ad_server_links)];
        chrome.runtime.sendMessage({ type: 'page_ads', article: ad_information3 });


        // console.log(ad_information3)
    }



});









