/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

var GeometryExtensions = {

  triangleFan: function(radius, depth, angle, nRadialSegments) {

    var geometry = new THREE.Geometry();
    var origin = new THREE.Vector3(0, 0, 0);

    // vertices //

    geometry.vertices.push(origin);

    var angleStep = angle / nRadialSegments;
    var nRimVertices = nRadialSegments + 1;

    for (var i = 0; i < nRimVertices; ++i) {

      var theta = angleStep * i;

      var rim = new THREE.Vector2(
        radius * Math.cos(theta),
        radius * Math.sin(theta)
      );

      geometry.vertices.push(
        new THREE.Vector3(
          rim.x, rim.y, -depth
        ));
    }

    geometry.verticesNeedUpdate = true;

    // faces //

    for (var j = 0; j < nRadialSegments; ++j) {

      geometry.faces.push(new THREE.Face3(0, j + 1, j + 2));  // ccw
    }

    geometry.elementsNeedUpdate = true;

    geometry.mergeVertices();  // i.e. if angle is 2pi, removes 1 duplicate

    return geometry;
  }
};
