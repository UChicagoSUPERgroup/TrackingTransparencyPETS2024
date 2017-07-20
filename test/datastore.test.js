describe('Background', function() {
  describe('Queries', function() {
    it('should return empty array', function() {
      assert.equal([], directQuery("get_trackers_by_page_visited", {domain: "www.nytimes.com"}));
    });
  });
});
