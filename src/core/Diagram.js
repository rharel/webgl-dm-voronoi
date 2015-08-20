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

  this._sites = {};
  this._id = 0;
  this._nSites = 0;

  this._maxDistance = Math.max(this._canvas.width, this._canvas.height);

  this._pointDistanceGeometry = PointSite.distanceGeometry(this._precision);

  this._lineDistancGeometry = {
    edge: LineSite.edgeDistanceGeometry(),
    endpoint: LineSite.endpointDistanceGeometry(this._precision)
  };

  this._markerLayer = new MarkerLayer();
  this._markerLayer.visible = options.markers;
  this._3d.add(this._markerLayer.origin);

  function _parseOptions(options) {

    var defaultOptions = {
      canvas: null,
      width: 500, height: 500,
      precision: 16,
      markers: true
    };

    if (typeof options === 'undefined') {
      return defaultOptions;
    }
    else {
      options.canvas = options.canvas || null;
      options.width = +options.width || defaultOptions.width;
      options.height = +options.height || defaultOptions.height;
      options.precision = +options.precision || defaultOptions.precision;
      options.markers = !!options.markers;

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

    this._add(site);

    return site;
  },

  line: function(a, b, color) {

    color = this._parseColor(color);

    var site = new LineSite(
      this._id++,
      a, b,
      this._maxDistance,
      this._lineDistancGeometry,
      this._3d.material(color)
    );

    this._add(site);

    return site;
  },

  _add: function(site) {

    this._sites[site.id] = site;
    this._nSites++;

    this._3d.add(site.origin);

    this._markerLayer.add(site);
  },

  remove: function(id_or_site) {

    var id = (typeof id_or_site === 'number') ? id_or_site : id_or_site.id;

    if (this._sites.hasOwnProperty(id)) {

      var site = this._sites[id];

      this._markerLayer.remove(site);

      this._3d.remove(site.origin);

      delete this._sites[id];
      this._nSites--;

      return true;
    }
    else { return false; }
  },

  render: function() { this._3d.render(); },

  resize: function() {

    this._maxDistance = Math.max(this._canvas.width, this._canvas.height);

    this._3d.resize();

    for (var id in this._sites) {
      this._sites[id].radius = this._maxDistance;
    }
  },

  get canvas() { return this._canvas; },

  get precision() { return this._precision; },

  get nSites() { return this._nSites; },

  get markers() { return this._markerLayer; }
};
