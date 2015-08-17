/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function Site(type, mesh) {

  this._type = type;
  this._mesh = mesh;
}

Site.prototype = {

  constructor: Site,

  get type() { return this._type; },
  get color() { return this._mesh.material.color; }
};

var SiteType = { point: 0 };
