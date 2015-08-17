/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function Context3D(canvas) {

  this._canvas = canvas;

  this._scene = new THREE.Scene();

  this._camera = new THREE.OrthographicCamera(
    0, canvas.width,
    canvas.height, 0,
    1, 1000
  );
  this._camera.position.z = 2;

  this._renderer = new THREE.WebGLRenderer({canvas: canvas});
  this._renderer.setClearColor(0x000000);

  this._material_cache = {};
}

Context3D.prototype = {

  constructor: Context3D,

  add: function(mesh) { this._scene.add(mesh); },

  render: function() { this._renderer.render(this._scene, this._camera); },

  material: function(color) {

    var key = color.getStyle();
    if (!this._material_cache.hasOwnProperty(key)) {

      this._material_cache[key] =
        new THREE.MeshBasicMaterial({color: color});
    }

    return this._material_cache[key];
  }
};
