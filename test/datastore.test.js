describe('Datastore', function() {
  describe('Queries', function() {
    it('Query empty domain', function(done) {
      const query =  directQuery("get_trackers_by_page_visited", {domain: "super.cs.uchicago.edu"});
      query.then(res => {
        // console.log(res);
        assert.equal([], res);
      }).then(done());
      
    });
  });
});
