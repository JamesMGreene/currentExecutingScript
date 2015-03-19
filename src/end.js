
    //
    // Export the API
    //
    var currentExecutingScript    = _nearestExecutingScript;      // default
    currentExecutingScript.near   = _nearestExecutingScript;
    currentExecutingScript.far    = _farthestExecutingScript;
    currentExecutingScript.origin = _originatingExecutingScript;


    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return currentExecutingScript;
  })
);
