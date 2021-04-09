module.exports = function (registry) {
  registry.preprocessor(function () {
    var self = this
    self.process(function (doc, reader) {

      if (!doc.hasAttribute('page-publish-type')) return reader

      var includes = doc.getAttribute('page-publish-type').split(",").map(function (value) {
        return value.trim();
      });

      if (!includes.length) return reader

      var lines = reader.lines
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("= ")) {
          includes.forEach( include => {
            lines.splice(++i,0,'','include::partial$publish-notes/'+include+'.adoc[]','') 
          })
        }
      }

      return reader
    })
  })
}
