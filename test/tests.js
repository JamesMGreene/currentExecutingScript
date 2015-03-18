/*global QUnit, getScriptUrlFromStack, _nearestExecutingScript, _farthestExecutingScript, _originatingExecutingScript */
/*jshint maxstatements:false */

(function(module, test, skip) {
  //"use strict";

  function cleanUrlPath(url) {
    return url.replace(/#.*$/, "").replace(/\?.*$/, "");
  }

  var inlineStackTemplates = [
        {
          browser:     "Chrome (Windows)",
          stackPrefix: "Error: my uncaught error\n    at ",
          stackSuffix: ":139:7\n    at jQuery.event.dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Firefox 3.6 (Windows)",
          stackPrefix: "Error(\"my error\")@:0\u000a([object Object])@",
          stackSuffix: ":129\u000a([object Object])@http://code.jquery.com/blah.js:123\u000afoo"
        },
        {
          browser:     "IE 10.0 (Windows)",
          stackPrefix: "Error: my uncaught error\n    at ",
          stackSuffix: ":139:7\n    at jQuery.event.dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "IE 10.0 (Windows) with custom error message",
          stackPrefix: "Error: my sneaky error message has a URL in it at http://google.com/mean.js:123\n    at Anonymous function (",
          stackSuffix: ":133:5)\n    at dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Opera (Windows)",
          stackPrefix: "<anonymous function>([arguments not available])@",
          stackSuffix: ":139\n<anonymous function: dispatch>([arguments not available])@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "PhantomJS (Windows)",
          stackPrefix: "Error: my error\n    at ",
          stackSuffix: ":139\n    at http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.0 (Mac)",
          stackPrefix: "@",
          stackSuffix: ":139\ndispatch@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.1 (Mac)",
          stackPrefix: "",
          stackSuffix: ":139:7\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        },
        {
          browser:     "Safari 7.0 (iOS)",
          stackPrefix: "",
          stackSuffix: ":139:7\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        }
      ];

  var externalStackTemplates = [
        {
          browser:     "Chrome (Windows)",
          stackPrefix: "Error: my error\n    at window.onload (",
          stackSuffix: ":95:11)\n    at jQuery.event.dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Firefox 3.6 (Windows)",
          stackPrefix: "Error(\"my error\")@:0\u000a@",
          stackSuffix: ":95\u000a([object Object])@http://code.jquery.com/blah.js:123\u000afoo"
        },
        {
          browser:     "IE 10.0 (Windows)",
          stackPrefix: "Error: my error\n    at onload (",
          stackSuffix: ":95:11)\n    at dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "IE 10.0 (Windows) with custom error message",
          stackPrefix: "Error: my sneaky error message has a URL in it at http://google.com/mean.js:123\n    at onload (",
          stackSuffix: ":95:11)\n    at dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Opera (Windows)",
          stackPrefix: "<anonymous function: window.onload>([arguments not available])@",
          stackSuffix: ":95\n<anonymous function: dispatch>([arguments not available])@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "PhantomJS (Windows)",
          stackPrefix: "Error: my error\n    at ",
          stackSuffix: ":95\n    at http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.0 (Mac)",
          stackPrefix: "onload@",
          stackSuffix: ":95\ndispatch@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.1 (Mac)",
          stackPrefix: "onload@",
          stackSuffix: ":95:11\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        },
        {
          browser:     "Safari 7.0 (iOS)",
          stackPrefix: "onload@",
          stackSuffix: ":95:11\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        }
      ];


  var _originalStackDepth;
  module("Stack parsing", {
    setup: function() {
      _originalStackDepth = _nearestExecutingScript.skipStackDepth;
      // Default is `1` but we are testing with the non-wrapped version so we need to reduce this to `0`
      _nearestExecutingScript.skipStackDepth = 0;
    },
    teardown: function() {
      _nearestExecutingScript.skipStackDepth = _originalStackDepth;
    }
  });


  test("`getScriptUrlFromStack` handles bad input", function(assert) {
    assert.expect(12);

    // Act & Assert
    assert.strictEqual(getScriptUrlFromStack(), null, "Should work when stack is not provided");
    assert.strictEqual(getScriptUrlFromStack(undefined), null, "Should work when stack is `undefined`");
    assert.strictEqual(getScriptUrlFromStack(null), null, "Should work when stack is `null`");
    assert.strictEqual(getScriptUrlFromStack(false), null, "Should work when stack is `false`");
    assert.strictEqual(getScriptUrlFromStack(true), null, "Should work when stack is `true`");
    assert.strictEqual(getScriptUrlFromStack(NaN), null, "Should work when stack is `NaN`");
    assert.strictEqual(getScriptUrlFromStack(0), null, "Should work when stack is `0`");
    assert.strictEqual(getScriptUrlFromStack(2), null, "Should work when stack is some non-falsy number");
    assert.strictEqual(getScriptUrlFromStack({}), null, "Should work when stack is an object");
    assert.strictEqual(getScriptUrlFromStack([]), null, "Should work when stack is an array");
    assert.strictEqual(getScriptUrlFromStack(function() {}), null, "Should work when stack is a function");
    assert.strictEqual(getScriptUrlFromStack(""), null, "Should work when stack is an empty string");
  });


  test("`getScriptUrlFromStack` parses inline script stacks correctly", function(assert) {
    assert.expect(inlineStackTemplates.length + 1);

    // Arrange
    var expected = "http://jsfiddle.net/JamesMGreene/t5dzL/show/";
    var stack;

    // Act & Assert
    assert.ok(inlineStackTemplates.length > 0, "Should have a list of inline stack templates");
    for (var i = 0, len = inlineStackTemplates.length; i < len; i++) {
      stack = inlineStackTemplates[i].stackPrefix + expected + inlineStackTemplates[i].stackSuffix;
      assert.strictEqual(getScriptUrlFromStack(stack), expected, "Should work for inline stack from " + inlineStackTemplates[i].browser);
    }
  });


  test("`getScriptUrlFromStack` parses external script stacks correctly", function(assert) {
    assert.expect(externalStackTemplates.length + 1);

    // Arrange
    var expected = "https://rawgit.com/JamesMGreene/b6b3d263f0806c5a9ab4/raw/0c4471eb6bee8ceef976ed72f36218eca0dc4b19/jsfiddle_7WE33.js";
    var stack;

    // Act & Assert
    assert.ok(externalStackTemplates.length > 0, "Should have a list of external stack templates");
    for (var i = 0, len = externalStackTemplates.length; i < len; i++) {
      stack = externalStackTemplates[i].stackPrefix + expected + externalStackTemplates[i].stackSuffix;
      assert.strictEqual(getScriptUrlFromStack(stack), expected, "Should work for external stack from " + externalStackTemplates[i].browser);
    }
  });


  test("`getScriptUrlFromStack` parses Blob URI script stacks correctly", function(assert) {
    assert.expect(externalStackTemplates.length + 1);

    // Arrange
    var expected = "blob:https://rawgit.com/0c4471eb6bee8ceef976ed72f36218eca0dc4b19.js";
    var stack;

    assert.ok(externalStackTemplates.length > 0, "Should have a list of Blob URI stack templates");
    for (var i = 0, len = externalStackTemplates.length; i < len; i++) {
      stack = externalStackTemplates[i].stackPrefix + expected + externalStackTemplates[i].stackSuffix;
      assert.strictEqual(getScriptUrlFromStack(stack), expected, "Should work for Blob URI stack from " + externalStackTemplates[i].browser);
    }
  });


  test("`getScriptUrlFromStack` parses Data URI script stacks correctly", function(assert) {
    // Arrange
    var expectedUrls = [
      "data:text/javascript,console.log(document.currentScript)%3B",
      "data:text/javascript;charset=UTF-8,console.log(document.currentScript)%3B",
      "data:text/javascript;charset=UTF-8;base64,Y29uc29sZS5sb2coZG9jdW1lbnQuY3VycmVudFNjcmlwdCk7",
      "data:text/javascript;base64,Y29uc29sZS5sb2coZG9jdW1lbnQuY3VycmVudFNjcmlwdCk7"
    ];
    var stack;

    assert.expect(externalStackTemplates.length * expectedUrls.length + 2);

    // Act & Assert
    assert.ok(externalStackTemplates.length > 0, "Should have a list of Data URI stack templates");
    assert.ok(expectedUrls.length > 0, "Should have a list of Data URI script contents");
    for (var i = 0, len = externalStackTemplates.length; i < len; i++) {
      for (var j = 0, len2 = expectedUrls.length; j < len2; j++) {
        stack = externalStackTemplates[i].stackPrefix + expectedUrls[j] + externalStackTemplates[i].stackSuffix;
        assert.strictEqual(getScriptUrlFromStack(stack), expectedUrls[j], "Should work for Data URI stack (Variation #" + (j + 1) + ") from " + externalStackTemplates[i].browser);
      }
    }
  });


  module("`_nearestExecutingScript`");

  test("works when called from non-strict mode", function(assert) {
    assert.expect(4);

    var near = _nearestExecutingScript();
    var nearSrc = near && near.hasAttribute("src") ? near.src : null;
    var nearSrcSubPath = nearSrc && typeof nearSrc === "string" ? cleanUrlPath(nearSrc) : null;
    assert.notEqual(near, null, "Should get some result");
    assert.strictEqual(near.nodeType, 1, "Should get a DOM element node");
    assert.strictEqual(near.nodeName, "SCRIPT", "Should get a `script` element node");
    assert.strictEqual(nearSrcSubPath.slice(-9), "/tests.js", "Should find the 'tests.js' file as source");
  });

  test("works when called from strict mode", function(assert) {
    "use strict";

    assert.expect(4);

    var near = _nearestExecutingScript();
    var nearSrc = near && near.hasAttribute("src") ? near.src : null;
    var nearSrcSubPath = nearSrc && typeof nearSrc === "string" ? cleanUrlPath(nearSrc) : null;
    assert.notEqual(near, null, "Should get some result");
    assert.strictEqual(near.nodeType, 1, "Should get a DOM element node");
    assert.strictEqual(near.nodeName, "SCRIPT", "Should get a `script` element node");
    assert.strictEqual(nearSrcSubPath.slice(-9), "/tests.js", "Should find the 'tests.js' file as source");
  });


  module("`_farthestExecutingScript`");

  skip("TODO: Implement! from non-strict mode", function(assert) {
    assert.expect(1);
    assert.strictEqual(_farthestExecutingScript(), null, "Shell implementation should return `null` for now");
  });

  skip("TODO: Implement! from strict mode", function(assert) {
    "use strict";

    assert.expect(1);
    assert.strictEqual(_farthestExecutingScript(), null, "Shell implementation should return `null` for now");
  });


  module("`_originatingExecutingScript`");

  skip("TODO: Implement! from non-strict mode", function(assert) {
    assert.expect(1);
    assert.strictEqual(_originatingExecutingScript(), null, "Shell implementation should return `null` for now");
  });

  skip("TODO: Implement! from strict mode", function(assert) {
    "use strict";

    assert.expect(1);
    assert.strictEqual(_originatingExecutingScript(), null, "Shell implementation should return `null` for now");
  });


})(QUnit.module, QUnit.test, QUnit.skip);
