
jasmineRequire.html = function(j$) {
  j$.ResultsNode = jasmineRequire.ResultsNode();
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter();
};

jasmineRequire.HtmlReporter = function(j$) {
  function HtmlReporter() {
      this.initialize = function(){};
  }
  return HtmlReporter;
};

jasmineRequire.HtmlSpecFilter = function() {
  function HtmlSpecFilter(options) {
      var filterString = options && options.filterString() && options.filterString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      var filterPattern = new RegExp(filterString);

      this.matches = function(specName) {
        return filterPattern.test(specName);
      };
  }
  return HtmlSpecFilter;
};

jasmineRequire.ResultsNode = function() {
  function ResultsNode(result, type, parent) {
      this.result = result;
      this.type = type;
      this.parent = parent;

      this.children = [];

      this.addChild = function(result, type) {
        this.children.push(new ResultsNode(result, type, this));
      };

      this.last = function() {
        return this.children[this.children.length - 1];
      };
  }
  return ResultsNode;
};

jasmineRequire.QueryString = function() {
  function QueryString() {
      this.navigateWithNewParam = function() {};

      this.fullStringWithNewParam = function() {};

      this.getParam = function() {};
  }
  return QueryString;
};
