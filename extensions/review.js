module.exports = function (registry) {
  registry.preprocessor(function () {
    var self = this
    self.process(function (doc, reader, target, attrs) {
      var pattern = /-review/
      
      if (doc.getAttribute('page-component-display-version').match(pattern)) {
        var lines = reader.lines
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("= ")) {
            lines.splice(++i,0,'','include::partial$review-info.adoc[]','') 
          }
        }
      }
      return reader
    })
  })
}
