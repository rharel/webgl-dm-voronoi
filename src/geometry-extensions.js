/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

var GeometryExtensions = {

  triangleFan: function(radius, depth, angle, nRadialSegments) {

    var geometry = new THREE.Geometry();

    var angleStep = angle / nRadialSegments;

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
          rim.x, rim.y, -depth
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
};
