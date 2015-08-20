/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function PointSite(id, x, y, radius, geometry, material) {

  Site.call(this, id, SiteType.point, material.color);

  this._mesh = new THREE.Mesh(geometry, material);
  this._mesh.scale.set(radius, radius, radius);

  this.x = x;
  this.y = y;
}

PointSite.distanceGeometry = function(nRadialSegments) {

  return GeometryExtensions.triangleFan(
    1, 1, 2 * Math.PI, nRadialSegments
  );
};

PointSite.prototype = Object.create(Site.prototype, {

  x: {
    get: function x() { return this._mesh.position.x; },
    set: function x(value) { this._mesh.position.x = value; }
  },

  y: {
    get: function y() { return this._mesh.position.y; },
    set: function y(value) { this._mesh.position.y = value; }
  },

  origin: {
    get: function origin() { return this._mesh; }
  },

  radius: {
    get: function radius() { return this._mesh.scale.x; },

    set: function radius(value) {

      this._mesh.scale.set(+value, +value, +value);
    }
  }
});

PointSite.prototype.constructor = PointSite;
