var assert = require('assert'),
rotaryTokenizer = require("../index")

describe('#getDefaultSettings()', function() {
  var settings = rotaryTokenizer.getDefaultSettings()
  var def = function(term) {
    var defs = settings.rootTerminologic.definitions
    for(var i = 0; i < defs.length; ++i) {
      if(defs[i].term === term) {
        return defs[i];
      }
    }
    return null;
  }
  var t = function(term, text) {
    var result = def(term).regex.exec(text)
    //console.log(def(term))
    //console.log(result)
    return !!(result && result.index === 0 && result[0] === text);
  }
  var f = function(term, text) {
    return !t(term, text);
  }
  it("blank, s",    function() { assert(t('blank', ' ')) })
  it("blank, t",    function() { assert(t('blank', '\t')) })
  it("blank, s-s",  function() { assert(t('blank', '  ')) })
  it("blank, s-t",  function() { assert(t('blank', ' \t')) })
  it("id, a",       function() { assert(t('id', 'a')) })
  it("id, 0",       function() { assert(f('id', '0')) })
  it("id, a-a",     function() { assert(t('id', 'aa')) })
  it("id, z-z",     function() { assert(t('id', 'zz')) })
  it("id, __",      function() { assert(t('id', '__')) })
  it("id, A-A",     function() { assert(t('id', 'AA')) })
  it("id, Z-Z",     function() { assert(t('id', 'ZZ')) })
  it("id, a-0-9",   function() { assert(t('id', 'a09')) })
  it('symbol, ~',   function() { assert(t('symbol', '~')) })
  it('symbol, !',   function() { assert(t('symbol', '!')) })
  it('symbol, @',   function() { assert(t('symbol', '@')) })
  it('symbol, #',   function() { assert(t('symbol', '#')) })
  it('symbol, $',   function() { assert(t('symbol', '$')) })
  it('symbol, %',   function() { assert(t('symbol', '%')) })
  it('symbol, ^',   function() { assert(t('symbol', '^')) })
  it('symbol, &',   function() { assert(t('symbol', '&')) })
  it('symbol, *',   function() { assert(t('symbol', '*')) })
  it('symbol, (',   function() { assert(t('symbol', '(')) })
  it('symbol, )',   function() { assert(t('symbol', ')')) })
  it('symbol, +',   function() { assert(t('symbol', '+')) })
  it('symbol, `',   function() { assert(t('symbol', '`')) })
  it('symbol, -',   function() { assert(t('symbol', '-')) })
  it('symbol, =',   function() { assert(t('symbol', '=')) })
  it('symbol, {',   function() { assert(t('symbol', '{')) })
  it('symbol, }',   function() { assert(t('symbol', '}')) })
  it('symbol, |',   function() { assert(t('symbol', '|')) })
  it('symbol, [',   function() { assert(t('symbol', '[')) })
  it('symbol, ]',   function() { assert(t('symbol', ']')) })
  it('symbol, \\',  function() { assert(t('symbol', '\\')) })
  it('symbol, :',   function() { assert(t('symbol', ':')) })
  it('symbol, "',   function() { assert(t('symbol', '"')) })
  it('symbol, ;',   function() { assert(t('symbol', ';')) })
  it('symbol, \'',  function() { assert(t('symbol', '\'')) })
  it('symbol, <',   function() { assert(t('symbol', '<')) })
  it('symbol, >',   function() { assert(t('symbol', '>')) })
  it('symbol, ?',   function() { assert(t('symbol', '?')) })
  it('symbol, ,',   function() { assert(t('symbol', ',')) })
  it('symbol, .',   function() { assert(t('symbol', '.')) })
  it('symbol, /',   function() { assert(t('symbol', '/')) })
});
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
    it("Zero length source",               function () { assert.equal(t(""),              '[]'                                                                                                                                                      ) })
    it("One token, id",                    function () { assert.equal(t("a"),             '[{"text":"a","term":"id"}]'                                                                                                                              ) })
    it("One token, blank 1",               function () { assert.equal(t(" "),             '[{"text":" ","term":"blank"}]'                                                                                                                           ) })
    it("One token, blank 2",               function () { assert.equal(t("  "),            '[{"text":"  ","term":"blank"}]'                                                                                                                          ) })
    it("LF",                               function () { assert.equal(t("\n"),            '[{"text":"\\n","term":"blank"}]'                                                                                                                         ) })
    it("Two tokens, id-blank",             function () { assert.equal(t("a "),            '[{"text":"a","term":"id"},{"text":" ","term":"blank"}]'                                                                                                  ) })
    it("One token, blank 2",               function () { assert.equal(t("  a"),           '[{"text":"  ","term":"blank"},{"text":"a","term":"id"}]'                                                                                                 ) })
    it("Line comment, start only",         function () { assert.equal(t("//"),            '[{"text":"//","term":"lc-start"}]'                                                                                                                       ) })
    it("Line comment, start-end",          function () { assert.equal(t("//\n"),          '[{"text":"//","term":"lc-start"},{"text":"\\n","term":"lc-end"}]'                                                                                        ) })
    it("Line comment, start-body-end",     function () { assert.equal(t("//xxx\n"),       '[{"text":"//","term":"lc-start"},{"text":"xxx","term":"lc-body"},{"text":"\\n","term":"lc-end"}]'                                                        ) })
    it("id lc-s lc-b lc-e",                function () { assert.equal(t("aaa//xxx\n"),    '[{"text":"aaa","term":"id"},{"text":"//","term":"lc-start"},{"text":"xxx","term":"lc-body"},{"text":"\\n","term":"lc-end"}]'                             ) })
    it("id lc-s lc-b lc-e",                function () { assert.equal(t("aaa//xxx\nbbb"), '[{"text":"aaa","term":"id"},{"text":"//","term":"lc-start"},{"text":"xxx","term":"lc-body"},{"text":"\\n","term":"lc-end"},{"text":"bbb","term":"id"}]'  ) })
    it("Block comment, end",               function () { assert.equal(t("*/"),            '[{"text":"*","term":"symbol"},{"text":"/","term":"symbol"}]'                                                                                             ) })
    it("Block comment, start",             function () { assert.equal(t("/*"),            '[{"text":"/*","term":"bc-start"}]'                                                                                                                       ) })
    it("Block comment, start",             function () { assert.equal(t("/*/"),           '[{"text":"/*","term":"bc-start"},{"text":"/","term":"bc-body"}]'                                                                                         ) })
    it("Block comment, start-body",        function () { assert.equal(t("/**"),           '[{"text":"/*","term":"bc-start"},{"text":"*","term":"bc-body"}]'                                                                                         ) })
    it("Block comment, start-end",         function () { assert.equal(t("/**/"),          '[{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"}]'                                                                                         ) })
    it("Block comment, start-body-end 1",  function () { assert.equal(t("/***/"),         '[{"text":"/*","term":"bc-start"},{"text":"*","term":"bc-body"},{"text":"*/","term":"bc-end"}]'                                                           ) })
    it("Block comment, start-body-end 2",  function () { assert.equal(t("/*z*/"),         '[{"text":"/*","term":"bc-start"},{"text":"z","term":"bc-body"},{"text":"*/","term":"bc-end"}]'                                                           ) })
    it("Block comment, start-body-end 3",  function () { assert.equal(t("/*z**/"),        '[{"text":"/*","term":"bc-start"},{"text":"z*","term":"bc-body"},{"text":"*/","term":"bc-end"}]'                                                          ) })
    it("Block comment, id-start-end",      function () { assert.equal(t("aaa/**/"),       '[{"text":"aaa","term":"id"},{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"}]'                                                              ) })
    it("Block comment, start-end-id",      function () { assert.equal(t("/**/bbb"),       '[{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"},{"text":"bbb","term":"id"}]'                                                              ) })
    it("Block comment, id-start-end-id",   function () { assert.equal(t("aaa/**/bbb"),    '[{"text":"aaa","term":"id"},{"text":"/*","term":"bc-start"},{"text":"*/","term":"bc-end"},{"text":"bbb","term":"id"}]'                                   ) })
  });
});
