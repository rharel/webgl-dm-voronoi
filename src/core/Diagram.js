/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function Diagram(options) {

  options = _parseOptions(options);

  if (options.canvas === null) {
    this._canvas = _createCanvas(options.width, options.height);
  }
  else {
    this._canvas = options.canvas;
  }

  this._3D = new Context3D(this._canvas);

  this._precision = options.precision;
  this._distanceMeasure = options.distanceMeasure;

  this._sites = [];

  this._maxDistance = Math.max(this._canvas.width, this._canvas.height);

  this._pointDG = PointSite.distanceGeometry(
    this._maxDistance,
    this._precision,
    this._distanceMeasure
  );


  function _parseOptions(options) {
    var defaultOptions = {
      canvas: null,
      width: 500, height: 500,
      precision: 16,
      distanceMeasure: Distance.euclidean
    };

    if (typeof options === 'undefined') {
      return defaultOptions;
    }
    else {
      options.canvas = options.canvas || null;
      options.width = +options.width || defaultOptions.width;
      options.height = +options.height || defaultOptions.height;
      options.precision = +options.precision || defaultOptions.precision;
      options.distanceMeasure = options.distanceMeasure ||
        defaultOptions.distanceMeasure;

      return options;
    }
  }

  function _createCanvas(width, height) {
    var canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
  }
}


Diagram.prototype = {

  constructor: Diagram,

  point: function(x, y, color) {

    if (typeof color === 'string') {
      color = new THREE.Color(color);
    }
    else {
      color = new THREE.Color(color.r, color.g, color.b);
    }

    var mesh = new THREE.Mesh(this._pointDG, this._3D.material(color));
    var site = new PointSite(x, y, mesh);

    this._sites.push(site);
    this._3D.add(mesh);
  },

  render: function() { this._3D.render(); },

  get canvas() { return this._canvas; },

  get precision() { return this._precision; },
  set precision(value) { this._precision = value; },

  get nSites() { return this._sites.length; }
};
