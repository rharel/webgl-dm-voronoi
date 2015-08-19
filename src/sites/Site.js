/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
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

var SiteType = { point: 0, line: 1 };
