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

PointSite.distanceGeometry = function(radius, precision, measure) {
  switch (measure) {

    case Distance.euclidean: {

      return PointSite.euclideanDistanceGeometry(radius, precision);
    }

    default: {

      var geometry = new THREE.Geometry();

      var nRadialSegments = precision;
      var angleStep = Math.PI * 2 / nRadialSegments;

      // vertices //

      var origin = new THREE.Vector3(0, 0, 0);
      geometry.vertices.push(origin);

      for (var i = 0; i < nRadialSegments; ++i) {

        var theta = angleStep * i;

        var rim = new THREE.Vector2(
          radius * Math.cos(theta),
          radius * Math.sin(theta)
        );

        geometry.vertices.push(
          new THREE.Vector3(
            rim.x, rim.y, -measure(origin, rim)
          ));
      }

      geometry.verticesNeedUpdate = true;

      // faces //

      for (var j = 0; j < nRadialSegments - 1; ++j) {

        geometry.faces.push(new THREE.Face3(0, j + 1, j + 2));  // ccw
      }

      geometry.faces.push(new THREE.Face3(0, nRadialSegments, 1));

      geometry.elementsNeedUpdate = true;

      return geometry;
    }
  }
};

PointSite.euclideanDistanceGeometry = function(radius, precision) {

  var geometry = THREE.CylinderGeometry.Cone(radius, radius, precision);

  var R = new THREE.Matrix4();
  R.makeRotationX(Math.PI / 2);

  var T = new THREE.Matrix4();
  T.makeTranslation(0, -radius / 2, 0);

  var M = new THREE.Matrix4();
  M.multiplyMatrices(R, T);

  geometry.applyMatrix(M);

  return geometry;
};
