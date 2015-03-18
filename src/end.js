
//
// Export the API
//
window.currentExecutingScript        = _nearestExecutingScript;  // default
window.currentExecutingScript.near   = _nearestExecutingScript;
window.currentExecutingScript.far    = _farthestExecutingScript;
window.currentExecutingScript.origin = _originatingExecutingScript;


})(window || this || document.defaultView, document);
