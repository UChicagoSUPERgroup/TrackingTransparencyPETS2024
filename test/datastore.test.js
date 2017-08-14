
// var fakePageLoad = {
//   domain: "super.cs.uchicago.edu"
//   pageId: 1502746446825.65 
//   path: "/"
//   protocol: "https"
//   title: "University of Chicago SUPERgroup -- Security, Usability, & Privacy. Education & Research at UChicago"
//   webRequests: []
// }

function simulatePageLoad(url) {
  let details = {
    frameId: 0,
    tabId: 12,
    timeStamp: Date.now(),
    url: url
  }

  updateMainFrameInfo(details);
}

describe('Extension', function() {

  // open page with no trackers
  // simulatePageLoad("https://super.cs.uchicago.edu");
  // simulatePageLoad("https://super.cs.uchicago.edu/members.html");

  // describe('Queries', function() {
  //   it('Record of visit to page', function() {

  //     return chrome.tabs.create({url: "https://super.cs.uchicago.edu", active: true})
  //       .then(() => chrome.tabs.update({url: "https://super.cs.uchicago.edu/members.html", active: true}))
      
  //       .then(() => directQuery("get_titles_by_domain", {domain: "super.cs.uchicago.edu"}))
  //       .then(res => {
  //         assert.equal("University of Chicago SUPERgroup -- Security, Usability, & Privacy. Education & Research at UChicago", res);
  //       });
  //   });


    it('No trackers on domain without tracker', function() {
      return directQuery("get_trackers_by_page_visited", {domain: "super.cs.uchicago.edu"})
        .then(res => {
          // console.log(res);
          assert.equal([], res);
        });
      // return query;
    });
  });
});
