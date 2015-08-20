/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

var Random = {

  sign: function() {

    return Math.random() <= 0.5 ? -1 : 1;
  },

  inRange: function (a, b) {
    return a + Math.random() * (b - a);
  },

  color: (function () {

    function mix(a, b) {
      return (a + b) / 2;
    }

    return function () {

      return {
        r: mix(Math.random(), 1),
        g: mix(Math.random(), 1),
        b: mix(Math.random(), 1)
      };
    };
  })()
};
