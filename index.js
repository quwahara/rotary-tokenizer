function Definition(pattern, term) {
  this.regex = new RegExp("^" + pattern)
  this.term = term
}
function Terminologic() {
  var self = this
  self.startDefinition = null
  self.endDefinition = null
  self.definitions = []
  self.substitutes = []
  self.restitution = null
  self.add = function(pattern, term) {
    self.definitions.push(new Definition(pattern, term))
    return self;
  }
}
function Token(text, term) {
  this.text = text
  this.term = term
}
function getDefaultSettings() {
  var settings = {}
  settings.rootTerminologic = new Terminologic()
  var root = function(pattern, term) {
    settings.rootTerminologic.add(pattern, term)
  }
  root("\\s+", "blank")
  root("\\w+", "id")
  root(".", "unknown")
  var lineCommentTerminologic = new Terminologic()
  lineCommentTerminologic.startDefinition = new Definition("//", "lc-start")
  lineCommentTerminologic.endDefinition = new Definition("(\\r\\n|\\r|\\n)", "lc-end")
  lineCommentTerminologic.add("[^\\r\\n]+", "lc-body")
  lineCommentTerminologic.restitution = settings.rootTerminologic
  settings.rootTerminologic.substitutes.push(lineCommentTerminologic)
  var blockCommentTerminologic = new Terminologic()
  blockCommentTerminologic.startDefinition = new Definition("/\\*", "bc-start")
  blockCommentTerminologic.endDefinition = new Definition("\\*/", "bc-end")
  blockCommentTerminologic.add("((?!\\*/).)+", "bc-body")
  blockCommentTerminologic.restitution = settings.rootTerminologic
  settings.rootTerminologic.substitutes.push(blockCommentTerminologic)
  return settings;
}
function Tokenizer(settings) {
  var self = this, text, nextIndex, terminologic
  self.init = function () {
    text = ""
    nextIndex = 0
    terminologic = settings.rootTerminologic
  }
  self.init()
  self.setText = function(v) { text = v }
  self.getText = function() { return text; }
  self.next = function() {
    if(nextIndex >= text.length) {
      return null;
    }
    var subtext = text.substr(nextIndex), token, candidates = []
    if(terminologic.endDefinition) {
      token = execDefinition(terminologic.endDefinition, subtext)
      if(token) {
        candidates.push([token, terminologic.restitution])
      }
    }
    for (var i = 0; i < terminologic.substitutes.length; ++i) {
      var s = terminologic.substitutes[i]
      if(s.startDefinition) {
        token = execDefinition(s.startDefinition, subtext)
        if(token) {
          candidates.push([token, s])
        }
      }
    }
    for (var i = 0; i < terminologic.definitions.length; ++i) {
      if(token = execDefinition(terminologic.definitions[i], subtext)) {
        candidates.push([token, terminologic])
      }
    }

    if(candidates.length === 0) {
      throw "No definition matched at " + nextIndex
    }

    var candidate = candidates[0]
    token = candidate[0]
    terminologic = candidate[1]
    for (var i = 1; i < candidates.length; ++i) {
      candidate = candidates[i]
      if(token.text.length < candidate[0].text.length) {
        token = candidate[0]
        terminologic = candidate[1]
      }
    }

    var len = token.text.length
    if(len === 0) {
      throw "Matched text length was 0."
    }
    nextIndex += len
    return token;
  }

  function execDefinition(d, subtext) {
    var result = d.regex.exec(subtext)
    return result && result.index === 0 ? new Token(result[0], d.term) : null;
  }
}
module.exports = {
  Definition: Definition,
  Terminologic: Terminologic,
  Token: Token,
  getDefaultSettings: getDefaultSettings,
  Tokenizer: Tokenizer,
  definition: function(pattern, term) {
    return new Definition(pattern, term);
  }
}
