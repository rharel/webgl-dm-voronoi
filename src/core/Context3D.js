/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

/**
 * The 3D context holds the webgl interface (with the help of three.js) and
 * exposes only the most general interface to the Diagram component.
 *
 * @constructor
 */
function Context3D(canvas) {

  this._canvas = canvas;

  this._scene = new THREE.Scene();

  this._camera = new THREE.OrthographicCamera(
    0, canvas.width,
    canvas.height, 0,
    1, Math.max(canvas.width, canvas.height)
  );
  this._camera.position.z = 2;

  this._renderer = new THREE.WebGLRenderer({canvas: canvas});
  this._renderer.setClearColor(0x000000);

  this._material_cache = {};
}

Context3D.prototype = {

  constructor: Context3D,

  add: function(mesh) { this._scene.add(mesh); },

  remove: function(mesh) { this._scene.remove(mesh); },

  render: function() { this._renderer.render(this._scene, this._camera); },

  /**
   * Call this when the drawing canvas changes size. It reconfigures the
   * rendering viewport as well as the camera projection matrix.
   */
  resize: function() {

    this._renderer.setSize(
      this._canvas.width,
      this._canvas.height
    );

    this._camera.right = this._canvas.width;
    this._camera.top = this._canvas.height;
    this._camera.far = Math.max(this._canvas.width, this._canvas.height) + 1;
    this._camera.updateProjectionMatrix();
  },

  /**
   * In case that for some reason the user uses identical colors for multiple
   * sites, we cache those here, or retrieved already cached versions if they
   * exist.
   */
  material: function(color) {

    var key = color.getStyle();
    if (!this._material_cache.hasOwnProperty(key)) {

      this._material_cache[key] =
        new THREE.MeshBasicMaterial({color: color});
    }

    return this._material_cache[key];
  }
};
