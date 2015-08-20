/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

/**
 * The main class of the library. Responsible for initializing a drawing canvas
 * (from scratch or from an existing one) and exposes an interface for creating
 * voronoi sites.
 *
 * Currently we support the following sites: point, and line (segment).
 *
 * @param options
 *  An object with the following optional properties:
 *    canvas:
 *      If present, will render into this element. Otherwise, will create
 *      a new canvas. The library user needs to add it to the DOM him/herself.
 *
 *    width, height:
 *      Desired size of the canvas, ignored if the canvas option is available.
 *
 *    precision:
 *      Positive integer which controls diagram refinement. The higher, the more
 *      detailed will the distance-meshes be, and thus the more correct
 *      the rendering becomes.
 *
 *    markers:
 *      Boolean. Indicates whether the site markers are initially visible.
 *
 * @constructor
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

  /**
   * Creates a new point site.

   * @returns {PointSite}
   *  The object returned is a reference to the created site.
   *  Changing the reference properties will have immediate effect on the
   *  diagram.
   */
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

  /**
   * Creates a new line site.
   *
   * @param a Object with {x: y:}
   * @param b Object with {x: y:}
   * @param color
   *  Either a css style string, or an object with {r:[0-1] g:[0-1] b:[0-1]}.
   *
   * @returns {LineSite}
   *  The object returned is a reference to the created site.
   *  Changing the reference properties will have immediate effect on the
   *  diagram.
   */
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

  /**
   * Removes a site from the diagram.
   *
   * @param id_or_site
   *  Either the site.id or the site object itself.
   *
   * @returns {boolean} True if the site was removed.
   */
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

  /**
   * Renders the diagram onto the canvas.
   */
  render: function() {

    if (this._markerLayer.visible) { this._markerLayer.update(); }
    this._3d.render();
  },

  /**
   * Resizes the diagram.
   *
   * Call this when the canvas' dimensions have changed.
   */
  resize: function() {

    this._maxDistance = Math.max(this._canvas.width, this._canvas.height);

    this._3d.resize();

    for (var id in this._sites) {
      this._sites[id].radius = this._maxDistance;
    }
  },

  /**
   * Gets the canvas tied to this.
   */
  get canvas() { return this._canvas; },

  /**
   * Gets the precision of this.
   */
  get precision() { return this._precision; },

  /**
   * Gets the number of sites (of all types together).
   *
   * @returns {number}
   */
  get nSites() { return this._nSites; },

  /**
   * Gets the marker layer object of this.
   *
   * @returns {MarkerLayer}
   */
  get markers() { return this._markerLayer; }
};
