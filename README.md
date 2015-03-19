# currentExecutingScript
[![GitHub Latest Release](https://badge.fury.io/gh/JamesMGreene%2FcurrentExecutingScript.png)](https://github.com/JamesMGreene/currentExecutingScript) [![Build Status](https://secure.travis-ci.org/JamesMGreene/currentExecutingScript.png?branch=master)](https://travis-ci.org/JamesMGreene/currentExecutingScript) [![Sauce Test Status](https://saucelabs.com/buildstatus/JamesMGreene_ces)](https://saucelabs.com/u/JamesMGreene_ces) [![Dependency Status](https://david-dm.org/JamesMGreene/currentExecutingScript.png?theme=shields.io)](https://david-dm.org/JamesMGreene/currentExecutingScript) [![Dev Dependency Status](https://david-dm.org/JamesMGreene/currentExecutingScript/dev-status.png?theme=shields.io)](https://david-dm.org/JamesMGreene/currentExecutingScript#info=devDependencies)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/JamesMGreene_ces.svg)](https://saucelabs.com/u/JamesMGreene_ces)

Get the currently executing script, regardless of its source/trigger/synchronicity. Similar to HTML5's [`document.currentScript`](http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#dom-document-currentscript) but arguably much more useful!


## Overview

### Loose

This utility comprises a set of behaviors for detecting the currently **executing** script, which does _not_ comply with the HTML spec's concept of `document.currentScript`. However, personally, I find it much more useful!

It can get the `script` element that was the source of the nearest (deepest) frame in the call stack (so, the currently executing code), regardless of whether or not said source script is being evaluated synchronously for the first time by the browser.

It also has experimental support for getting the `script` element that was the source of the farthest (most shallow) frame in the call stack, regardless of whether or not said source script is being evaluated synchronously for the first time by the browser.

Finally, it has experimental support for getting the `script` element _or attribute node_ (e.g. `onclick`) responsible for creating the current call stack.


### Strict

If you are only interested in getting the currently **synchronously _evaluating_** script (i.e. like an HTML spec-compliant polyfill for `document.currentScript`), take a look at [JamesMGreene/document.currentScript](https://github.com/JamesMGreene/document.currentScript) instead.


## Browser Compatibility

_Forthcoming...._


## Installation

### NPM

```shell
npm install current-executing-script
```

### GitHub

Alternatively, you can download/clone its GitHub repo: [JamesMGreene/currentExecutingScript](https://github.com/JamesMGreene/currentExecutingScript)


## Usage

### Nearest

To get the nearest (deepest) script for the current call stack:

```js
var scriptEl1 = currentExecutingScript();
var scriptEl2 = currentExecutingScript.near();
```


### Farthest

_**EXPERIMENTAL!!!**_

To get the farthest (most shallow) script for the current call stack:

```js
var scriptEl = currentExecutingScript.far();
```

**IMPORTANT:** Note that the accuracy of this may be limited by the allowed stack depth of each browser. For example, Chrome defaults to collecting a maximum of the 10 nearest frames but [can be configured to collect more](https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi) (see `Error.stackTraceLimit` and `--stack-trace-limit`). This library will automatically configure it to `Infinity` on your behalf.


### Origin

_**EXPERIMENTAL!!!**_

To get the script _or attribute node_ (e.g. `onclick`) responsible for initiating the current call stack:

```js
var scriptElOrAttrNode = currentExecutingScript.origin();
```

In most situations, the result of `.origin()` will commonly match the result of `.far()` unless the current call stack was initiated by something other than a `script` element (e.g. an `onclick` attribute node).

**IMPORTANT:** Note that the accuracy of this may be limited by the allowed stack depth of each browser. For example, Chrome defaults to collecting a maximum of the 10 nearest frames but [can be configured to collect more](https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi) (see `Error.stackTraceLimit` and `--stack-trace-limit`). This library will automatically configure it to `Infinity` on your behalf.


## Configuration

### `skipStackDepth`

The stack depth to skip over when analyzing call stack frames (defaults to `1`, to ensure it skips over its own functions).



## Errata

 - MDN docs for `document.currentScript`: https://developer.mozilla.org/en-US/docs/Web/API/document.currentScript
 - Demo using old Gist: http://jsfiddle.net/JamesMGreene/9DFc9/
 - Original location, old Gist: https://gist.github.com/JamesMGreene/fb4a71e060da6e26511d
