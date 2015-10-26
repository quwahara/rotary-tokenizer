var assert = require('assert'),
rotaryTokenizer = require("../index")

describe('Tokenizer', function() {
  describe('#next()', function () {
    var definition = rotaryTokenizer.definition
    var settings = rotaryTokenizer.getDefaultSettings()
    var tkn = new rotaryTokenizer.Tokenizer(settings)
    var t = function(inp) {
      tkn.init()
      tkn.setText(inp)
      var ts = []
      for(var token = tkn.next(); token !== null; token = tkn.next()) {
        ts.push(token)
      }
      return JSON.stringify(ts);
    }
    it("Zero length source",               function () { assert.equal('[]',                                                                                                                                                      t("")) })
    it("One token, id",                    function () { assert.equal('[{"text":"a","term":"id"}]',                                                                                                                              t("a")) })
    it("One token, blank 1",               function () { assert.equal('[{"text":" ","term":"blank"}]',                                                                                                                           t(" ")) })
    it("One token, blank 2",               function () { assert.equal('[{"text":"  ","term":"blank"}]',                                                                                                                          t("  ")) })
    it("LF",                               function () { assert.equal('[{"text":"\\n","term":"blank"}]',                                                                                                                         t("\n")) })
    it("Two tokens, id-blank",             function () { assert.equal('[{"text":"a","term":"id"},{"text":" ","term":"blank"}]',                                                                                                  t("a ")) })
    it("One token, blank 2",               function () { assert.equal('[{"text":"  ","term":"blank"},{"text":"a","term":"id"}]',                                                                                                 t("  a")) })
    it("Line comment, start only",         function () { assert.equal('[{"text":"//","term":"lc-start"}]',                                                                                                                       t("//")) })
    it("Line comment, start-end",          function () { assert.equal('[{"text":"//","term":"lc-start"},{"text":"\\n","term":"lc-end"}]',                                                                                        t("//\n")) })
    it("Line comment, start-body-end",     function () { assert.equal('[{"text":"//","term":"lc-start"},{"text":"xxx","term":"lc-body"},{"text":"\\n","term":"lc-end"}]',                                                        t("//xxx\n")) })
    it("id lc-s lc-b lc-e",                function () { assert.equal('[{"text":"aaa","term":"id"},{"text":"//","term":"lc-start"},{"text":"xxx","term":"lc-body"},{"text":"\\n","term":"lc-end"}]',                             t("aaa//xxx\n")) })
    it("id lc-s lc-b lc-e",                function () { assert.equal('[{"text":"aaa","term":"id"},{"text":"//","term":"lc-start"},{"text":"xxx","term":"lc-body"},{"text":"\\n","term":"lc-end"},{"text":"bbb","term":"id"}]',  t("aaa//xxx\nbbb")) })
    it("Block comment, end",               function () { assert.equal('[{"text":"*","term":"unknown"},{"text":"/","term":"unknown"}]',                                                                                           t("*/")) })
    it("Block comment, start",             function () { assert.equal('[{"text":"/*","term":"bc-start"}]',                                                                                                                       t("/*")) })
    it("Block comment, start",             function () { assert.equal('[{"text":"/*","term":"bc-start"},{"text":"/","term":"bc-body"}]',                                                                                         t("/*/")) })
    it("Block comment, start-body",        function () { assert.equal('[{"text":"/*","term":"bc-start"},{"text":"*","term":"bc-body"}]',                                                                                         t("/**")) })
    it("Block comment, start-end",         function () { assert.equal('[{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"}]',                                                                                         t("/**/")) })
    it("Block comment, start-body-end 1",  function () { assert.equal('[{"text":"/*","term":"bc-start"},{"text":"*","term":"bc-body"},{"text":"*/","term":"bc-end"}]',                                                           t("/***/")) })
    it("Block comment, start-body-end 2",  function () { assert.equal('[{"text":"/*","term":"bc-start"},{"text":"z","term":"bc-body"},{"text":"*/","term":"bc-end"}]',                                                           t("/*z*/")) })
    it("Block comment, start-body-end 3",  function () { assert.equal('[{"text":"/*","term":"bc-start"},{"text":"z*","term":"bc-body"},{"text":"*/","term":"bc-end"}]',                                                          t("/*z**/")) })
    it("Block comment, id-start-end",      function () { assert.equal('[{"text":"aaa","term":"id"},{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"}]',                                                              t("aaa/**/")) })
    it("Block comment, start-end-id",      function () { assert.equal('[{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"},{"text":"bbb","term":"id"}]',                                                              t("/**/bbb")) })
    it("Block comment, id-start-end-id",   function () { assert.equal('[{"text":"aaa","term":"id"},{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"},{"text":"bbb","term":"id"}]',                                   t("aaa/**/bbb")) })
  });
});
