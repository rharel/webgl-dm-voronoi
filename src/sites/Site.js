/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

/**
 * Describes a generic site. Concrete site types extend this class.
 *
 * @param id Unique site identifier
 * @param type Site type @see SiteType
 * @param color Color associated with this site
 *
 * @constructor
 */
function Site(id, type, color) {

  this._id = id;
  this._type = type;
  this._color = color;
}

Site.prototype = {

  constructor: Site,

  get id() { return this._id; },
  get type() { return this._type; },
  get color() { return this._color; }
};

/**
 * Site type enumerator.
 *
 * We currently support the following sites: point and line.
 * @type {{point: number, line: number}}
 */
var SiteType = { point: 0, line: 1 };
