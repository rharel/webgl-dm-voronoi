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

  this._3d = new Context3D(this._canvas);

  this._precision = options.precision;

  this._sites = [];
  this._id = 0;

  this._maxDistance = Math.max(this._canvas.width, this._canvas.height);

  this._pointDistanceGeometry = PointSite.distanceGeometry(this._precision);

  this._lineDistancGeometry = {
    edge: LineSite.edgeDistanceGeometry(this._precision),
    endpoint: LineSite.endpointDistanceGeometry(this._precision)
  };

  this._markerLayer = new MarkerLayer();
  this._3d.add(this._markerLayer.origin);

  function _parseOptions(options) {

    var defaultOptions = {
      canvas: null,
      width: 500, height: 500,
      precision: 16,
      showSiteMarkers: false
    };

    if (typeof options === 'undefined') {
      return defaultOptions;
    }
    else {
      options.canvas = options.canvas || null;
      options.width = +options.width || defaultOptions.width;
      options.height = +options.height || defaultOptions.height;
      options.precision = +options.precision || defaultOptions.precision;

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

  _parseColor: function(color) {
    if (typeof color === 'string') {
       return new THREE.Color(color);
    }
    else {
      return new THREE.Color(color.r, color.g, color.b);
    }
  },

  point: function(x, y, color) {

    color = this._parseColor(color);

    var site = new PointSite(
      this._id++,
      x, y,
      this._maxDistance,
      this._pointDistanceGeometry,
      this._3d.material(color)
    );

    this._sites.push(site);
    this._3d.add(site.origin);

    this._markerLayer.add(site);

    return site;
  },

  line: function(a, b, color) {

    color = this._parseColor(color);

    var site = new LineSite(
      a, b,
      this._maxDistance,
      this._lineDistancGeometry,
      this._3d.material(color)
    );

    this._sites.push(site);
    this._3d.add(site.origin);

    return site;
  },

  render: function() { this._3d.render(); },

  get canvas() { return this._canvas; },

  get precision() { return this._precision; },

  get nSites() { return this._sites.length; },

  get markers() { return this._markerLayer; }
};
