/*exported _farthestExecutingScript, _originatingExecutingScript, _nearestExecutingScript */

var scriptReadyRegex = /^(interactive|loaded|complete)$/;

// This page's URL (minus query string and fragment identifer hash, if any)
var fullPageUrl = !!window.location ? window.location.href : null;
var pageUrl = fullPageUrl ? fullPageUrl.replace(/#.*$/, "").replace(/\?.*$/, "") || null : null;

// Live NodeList collection
var scripts = document.getElementsByTagName("script");

// Check if the browser supports the `readyState` property on `script` elements
var supportsScriptReadyState = "readyState" in (scripts[0] || document.createElement("script"));

// Lousy browser detection for [not] Opera
var isNotOpera = !window.opera || window.opera.toString() !== "[object Opera]";

// Detect if `document.currentScript` is supported
var hasNativeCurrentScriptAccessor = "currentScript" in document;

var originalStackDepthConfig;
// Detect if the V8 Error Stack Trace API is supported
if ("stackTraceLimit" in Error && Error.stackTraceLimit !== Infinity) {
  originalStackDepthConfig = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
}


// In some browsers (e.g. Chrome), you can get the current stack from an Error
// object instance without needing to throw it. Avoiding an unnecessary
// use of `throw` saves time and performance.
var hasStackBeforeThrowing = false,
    hasStackAfterThrowing = false;
(function() {
  try {
    var err = new Error();
    hasStackBeforeThrowing = typeof err.stack === "string" && !!err.stack;
    throw err;
  }
  catch (thrownErr) {
    hasStackAfterThrowing = typeof thrownErr.stack === "string" && !!thrownErr.stack;
  }
})();


// Normalize whitespace within a string
function normalizeWhitespace(str) {
  return str ? str.replace(/^\s+$|\s+$/g, "").replace(/\s\s+/g, " ") : "";
}

// Get script object based on the `src` URL
function getScriptFromUrl(url, eligibleScripts) {
  var i,
      script = null;

  eligibleScripts = eligibleScripts || scripts;

  if (typeof url === "string" && url) {
    for (i = eligibleScripts.length; i--; ) {
      if (eligibleScripts[i].src === url) {
        // NOTE: Could check if the same script URL is used by more than one `script` element
        // here... but let's not. That would yield less useful results in "loose" detection. ;)
        script = eligibleScripts[i];
        break;
      }
    }
  }
  return script;
}

// Get script object based on the caller function's source code body (text)
function getInlineScriptFromCallerSource(callerFnSource, eligibleScripts) {
  var i, inlineScriptText,
      script = null,
      callerSourceText = normalizeWhitespace(callerFnSource);

  eligibleScripts = eligibleScripts || scripts;

  if (callerFnSource && callerSourceText) {
    for (i = eligibleScripts.length; i--; ) {
      // Only look at inline scripts
      if (!eligibleScripts[i].hasAttribute("src")) {
        inlineScriptText = normalizeWhitespace(eligibleScripts[i].text);
        if (inlineScriptText.indexOf(callerSourceText) !== -1) {
          // If more than one match is found, don't return any
          if (script) {
            script = null;
            break;
          }
          script = eligibleScripts[i];
        }
      }
    }
  }

  return script;
}

// If there is only a single inline script on the page, return it; otherwise `null`
function getSoleInlineScript(eligibleScripts) {
  var i, len,
      script = null;
  eligibleScripts = eligibleScripts || scripts;
  for (i = 0, len = eligibleScripts.length; i < len; i++) {
    if (!eligibleScripts[i].hasAttribute("src")) {
      if (script) {
        script = null;
        break;
      }
      script = eligibleScripts[i];
    }
  }
  return script;
}

// Get the currently executing script URL from an Error stack trace
function getScriptUrlFromStack(stack, skipStackDepth) {
  var matches, remainingStack,
      url = null,
      ignoreMessage = typeof skipStackDepth === "number";
  skipStackDepth = ignoreMessage ? Math.round(skipStackDepth) : 0;
  if (typeof stack === "string" && stack) {
    if (ignoreMessage) {
      matches = stack.match(/(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
    }
    else {
      matches = stack.match(/^(?:|[^:@]*@|.+\)@(?=data:text\/javascript|blob|http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);

      if (!(matches && matches[1])) {
        matches = stack.match(/\)@(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
      }
    }

    if (matches && matches[1]) {
      if (skipStackDepth > 0) {
        remainingStack = stack.slice(stack.indexOf(matches[0]) + matches[0].length);
        url = getScriptUrlFromStack(remainingStack, (skipStackDepth - 1));
      }
      else {
        url = matches[1];
      }
    }

    // TODO: Handle more edge cases!
    // Fixes #1
    // See https://github.com/JamesMGreene/currentExecutingScript/issues/1

    // ???

  }
  return url;
}


// Get the farthest currently executing (i.e. yes, EXECUTING) `script` DOM
// element for the caller function, regardless of whether it is that `script`
// DOM element is currently being evaluated for the first time. The farthest
// currently executing `script` DOM element would typically be considered the
// originator of the current execution stack.
function _farthestExecutingScript() {
  /*jshint noarg:false */

  // TODO: Implement!
  // Fixes #3
  // See https://github.com/JamesMGreene/currentExecutingScript/issues/3
  return null;

/*
  // Yes, this IS possible, i.e. if a script removes other scripts (or itself)
  if (scripts.length === 0) {
    return null;
  }

  // Guaranteed accurate in IE 6-10.
  // Not accurate/supported in any other browsers.
  if (isNotOpera && supportsScriptReadyState) {
    for (var i = scripts.length; i--; ) {
      if (scripts[i].readyState === "interactive") {
        return scripts[i];
      }
    }
  }

  var stack,
      e = new Error();
  if (hasStackBeforeThrowing) {
    stack = e.stack;
  }
  if (!stack && hasStackAfterThrowing) {
    try {
      throw e;
    }
    catch (err) {
      // NOTE: Cannot use `err.sourceURL` or `err.fileName` as they will always be THIS script
      stack = err.stack;
    }
  }
  if (stack) {
    var url = getScriptUrlFromStack(stack, skipStackDepth);
    var script = getScriptFromUrl(url, scripts );
    if (!script && pageUrl && url === pageUrl) {
      // Try to find the correct inline script by searching through
      // inline scripts' text content for the caller function's source
      // code to be present. If the caller function's source code is
      // not available, see if there is only one inline script element
      // in the DOM and return that (even though it may be wrong)

      // TODO: Implement!
      // Fixes #4 in part
      // See https://github.com/JamesMGreene/currentExecutingScript/issues/4

      var callerFn = _farthestExecutingScript.caller || null,
          callerFnStack = [],
          callerFnSource = null;

      while (callerFn) {
        callerFnStack.push(callerFn);
        callerFn = callerFn.caller || null;
      }
      callerFn = callerFnStack.slice(-1)[0];
      callerFnSource = callerFn ? ("" + callerFn) : null;


      if (callerFnSource) {
        script = getInlineScriptFromCallerSource(callerFnSource);
      }
      else {
        // NOTE: This is a loose assumption that could be inaccurate!
        //
        // Inaccuracies:
        //  - If the inline script that initiated the call was also removed from the DOM.
        //  - If the call was initiated by an element's inline event handler,
        //    e.g. `<a onclick="(function() { alert(currentExecutingScript()); }()">click</a>`
        script = getSoleInlineScript();
      }
    }
    return script;
  }

  // NOTE: This is a loose assumption that could be inaccurate!
  //
  // Inaccuracies:
  //  - If a script is created dynamically and appended to some position
  //    other than the very end of the document.
  //  - If multiple scripts are created dynamically and all appended to the
  //    same position within the document (and do not have their `async` attributes
  //    set to `false`, at least in browsers that support async script evaluation.
  //    other than the very end of the document.
  //  - If any scripts are added with the `async` attribute set to `true` in a browser
  //    that supports it.
  //  - May get confused by `script` elements within `svg` elements
  return scripts[scripts.length - 1] || null;
*/
}


// Get the originating currently executing (i.e. yes, EXECUTING) `script` DOM
// element or attribute node (e.g. `onclick`) for the caller function,
// regardless of whether it is that `script` DOM element is currently being
// evaluated for the first time. The originating currently executing `script`
// DOM element [or attribute node] is the originator of the current execution stack.
function _originatingExecutingScript() {
  // TODO: Implement!
  // Fixes #2
  // See https://github.com/JamesMGreene/currentExecutingScript/issues/2
  return null;
}

// Get the nearest currently executing (i.e. yes, EXECUTING) `script` DOM
// element for the caller function, regardless of whether it is that `script`
// DOM element is currently being evaluated for the first time.
function _nearestExecutingScript() {
  /*jshint noarg:false */

  // Yes, this IS possible, i.e. if a script removes other scripts (or itself)
  if (scripts.length === 0) {
    return null;
  }

  var i, e, stack, url, script,
      eligibleScripts = [],
      skipStackDepth = _nearestExecutingScript.skipStackDepth || 1,

      // TODO: Implement!
      // Fixes #4 in part
      // See https://github.com/JamesMGreene/currentExecutingScript/issues/4
      callerFnSource = null;  //("" + (_nearestExecutingScript.caller || "")) || null;

  // This part will only help in IE 6-10.
  for (i = 0; i < scripts.length; i++) {
    if (isNotOpera && supportsScriptReadyState) {
      if (scriptReadyRegex.test(scripts[i].readyState)) {
        eligibleScripts.push(scripts[i]);
      }
    }
    else {
      eligibleScripts.push(scripts[i]);
    }
  }

  e = new Error();
  if (hasStackBeforeThrowing) {
    stack = e.stack;
  }
  if (!stack && hasStackAfterThrowing) {
    try {
      throw e;
    }
    catch (err) {
      // NOTE: Cannot use `err.sourceURL` or `err.fileName` as they will always be THIS script
      stack = err.stack;
    }
  }

  if (stack) {
    url = getScriptUrlFromStack(stack, skipStackDepth);
    script = getScriptFromUrl(url, eligibleScripts);

    if (!script && pageUrl && url === pageUrl) {
      // Try to find the correct inline script by searching through
      // inline scripts' text content for the caller function's source
      // code to be present.
      if (callerFnSource) {
        script = getInlineScriptFromCallerSource(callerFnSource, eligibleScripts);
      }
      // If the caller function's source code is not available, see if
      // there is only one inline script element in the DOM and return
      // that (even though it may be wrong)...
      else {
        // NOTE: This is a loose assumption that could be inaccurate!
        //
        // Inaccuracies:
        //  - If the inline script that initiated the call was also removed from the DOM.
        //  - If the call was initiated by an element's inline event handler,
        //    e.g. `<a onclick="(function() { alert(currentExecutingScript()); }()">click</a>`
        script = getSoleInlineScript(eligibleScripts);
      }
    }
  }

  //
  // Welcome to the Island of Inaccurate Assumptions!
  // NOTE: ALL of the following are loose assumptions that could be inaccurate!
  //

  if (!script) {
    // Inaccuracies:
    //  - If the inline script that initiated the call was also removed from the DOM.
    //  - If the call was initiated by an element's inline event handler,
    //    e.g. `<a onclick="(function() { alert(currentExecutingScript()); }()">click</a>`
    if (eligibleScripts.length === 1) {
      script = eligibleScripts[0];
    }
  }

  if (!script) {
    // Inaccuracies:
    //  - If script currently being synchronously evaluated by the parser is the
    //    originator of this call stack but NOT the source script of the caller/invocation
    //    e.g.
    //    ```html
    //    <script id="a">
    //    function getCurrentScriptCallerFn() {
    //      return currentExecutingScript.near();
    //    }
    //    </script>
    //    <script id="b">
    //    // Should get `script[id="a"]` but will get `script[id="b"]` instead
    //    getCurrentScriptCallerFn();
    //    </script>
    if (hasNativeCurrentScriptAccessor) {
      script = document.currentScript;
    }
  }

  if (!script) {
    // Inaccuracies:
    //  - If script currently being synchronously evaluated by the parser is the
    //    originator of this call stack but NOT the source script of the caller/invocation
    //    e.g.
    //    ```html
    //    <script id="a">
    //    function getCurrentScriptCallerFn() {
    //      return currentExecutingScript.near();
    //    }
    //    </script>
    //    <script id="b">
    //    // Should get `script[id="a"]` but will get `script[id="b"]` instead
    //    getCurrentScriptCallerFn();
    //    </script>
    if (isNotOpera && supportsScriptReadyState) {
      for (i = eligibleScripts.length; i--; ) {
        if (eligibleScripts[i].readyState === "interactive") {
          script = eligibleScripts[i];
          break;
        }
      }
    }
  }

  if (!script) {
    // Inaccuracies:
    //  - If a script is created dynamically and appended to some position
    //    other than the very end of the document.
    //  - If multiple scripts are created dynamically and all appended to the
    //    same position within the document (and do not have their `async` attributes
    //    set to `false`, at least in browsers that support async script evaluation.
    //    other than the very end of the document.
    //  - If any scripts are added with the `async` attribute set to `true` in a browser
    //    that supports it.
    //  - May get confused by `script` elements within `svg` elements
    //  - If script currently being synchronously evaluated by the parser is the
    //    originator of this call stack but NOT the source script of the caller/invocation
    //    e.g.
    //    ```html
    //    <script id="a">
    //    function getCurrentScriptCallerFn() {
    //      return currentExecutingScript.near();
    //    }
    //    </script>
    //    <script id="b">
    //    // Should get `script[id="a"]` but will get `script[id="b"]` instead
    //    getCurrentScriptCallerFn();
    //    </script>
    //    ```
    script = eligibleScripts[eligibleScripts.length - 1] || null;
  }

  return script;
}

// Default stack depth to skip over when analyzing call stack frames
_nearestExecutingScript.skipStackDepth = 1;

