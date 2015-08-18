/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function PointSite(x, y, mesh) {

  Site.call(this, SiteType.point, mesh);

  this.x = x;
  this.y = y;
}

PointSite.prototype = Object.create(Site.prototype, {

  x: {
    get: function x() { return this._mesh.position.x; },
    set: function x(value) { this._mesh.position.x = value; }
  },

  y: {
    get: function y() { return this._mesh.position.y; },
    set: function y(value) { this._mesh.position.y = value; }
  }
});

PointSite.prototype.constructor = PointSite;

PointSite.distanceGeometry = function(radius, nRadialSegments) {

  return GeometryExtensions.triangleFan(
    radius, radius, 2 * Math.PI, nRadialSegments
  );
};