/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

var Distance = {

  euclidean: function(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  },

  manhattan: function(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
};
