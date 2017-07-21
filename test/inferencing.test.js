// let inferencingWorker = new Worker('../extension/dist/inferencing.js');

// function sendPage(article) {
//   inferencingWorker.postMessage({
//         type: "content_script_to_inferencing",
//         article: article,
//         mainFrameReqId: 12345,
//   });
// }

// async function makeInference(article) {
//   const tr = await tree;
  
//   const category = infer(article, tr);
//   return category[0].name;
// }

// describe('Inferencing', function() {
//   describe('NYTimes', function() {
//     it('New York Times', function(done) {
//       const inference = makeInference(honda);
//       inference.then(res => {
//         console.log(res);
//         assert.equal("", res);
//       }).then(done());
      
//     });
//   });
// });
