/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

var GeometryExtensions = {

  /**
   * Generate a triangle fan geometry.
   *
   * @param radius
   * @param depth
   * @param angle
   * @param nRadialSegments
   *
   * @returns {THREE.Geometry}
   *
   * @details
   *  The triangle fan is a portion of a cone, with central source vertex
   *  at the origin, and base vertices at z = -depth
   *  The base vertices form an arc of the given angle, and their frequency
   *  along the arc is determined by the nRadialSegments parameter.
   */
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
  },

  /**
   * Generates a tent geometry with given width, height and depth.
   *
   * @details
   *  Call the parameter width 'w', height 'h' and depth 'd'.
   *
   *  The edge forming the tent-top is centered at the origin.
   *  The tent is h units long on the y-axis, and w units wide on the x-axis.
   *  The tent extrudes towards the negative z-axis, up until z = -d
   *
   * @returns {THREE.Geometry}
   */
  tent: function(width, height, depth) {

    var geometry = new THREE.Geometry();

    // vertices //

    var h2 = height / 2;
    var w2 = width / 2;

    geometry.vertices = [

      new THREE.Vector3(0, -h2, 0),
      new THREE.Vector3(0,  h2, 0),

      new THREE.Vector3(-w2, -h2, -depth),  // LB
      new THREE.Vector3(-w2,  h2, -depth),  // LT

      new THREE.Vector3( w2, -h2, -depth),  // RB
      new THREE.Vector3( w2,  h2, -depth)   // RT
    ];

    geometry.verticesNeedUpdate = true;

    // faces //

    // B = 0, T = 1, LB = 2, LT = 3, RB = 4, RT = 5;
    geometry.faces = [

      new THREE.Face3(0, 3, 2),
      new THREE.Face3(0, 1, 3),

      new THREE.Face3(0, 4, 5),
      new THREE.Face3(0, 5, 1)
    ];

    geometry.elementsNeedUpdate = true;

    return geometry;
  }
};
