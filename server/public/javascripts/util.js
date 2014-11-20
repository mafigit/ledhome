window.LedHome = window.LedHome || {};
LedHome.Util = (function() {
  var pub = {};

  var componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  pub.rgbToHex = function(r, g, b) { return "#" + componentToHex(r) +
    componentToHex(g) + componentToHex(b);
  }

  return pub;
}());
