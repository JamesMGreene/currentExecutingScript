(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === "object") {
    // CommonJS-like environments that support `module.exports`,
    // like Node.js. Does not work with strict CommonJS!
    module.exports = factory();
  } else {
    // Browser globals (`root` is `window`)
    root.currentExecutingScript = factory();
  }
}(
  // Current context/scope
  this || window,

  // Factory function to return the export
  function() {
