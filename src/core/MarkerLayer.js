/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function MarkerLayer() {

  this._sites = {};
  this._markers = {};
  this._origin = new THREE.Object3D();

  this.visible = false;
}

MarkerLayer.material = new THREE.MeshBasicMaterial({color: 0x000000});
MarkerLayer.markerSize = 10;
MarkerLayer.geometry = new THREE.PlaneGeometry(
  MarkerLayer.markerSize,
  MarkerLayer.markerSize
);

MarkerLayer.prototype = {

  constructor: MarkerLayer,

  add: function(site) {

    if (!!this._markers[site.id]) { return; }

    var mesh;

    switch (site.type) {

      default: {  // point

        mesh = new THREE.Mesh(MarkerLayer.geometry, MarkerLayer.material);
        break;
      }
    }

    this._sites[site.id] = site;
    this._markers[site.id] = mesh;
    this._origin.add(mesh);
  },

  remove: function(site) {

    if (!this._markers[site.id]) { return; }

    var mesh = this._markers[site.id];
    this._origin.remove(mesh);
    this._markers[site.id] = null;
    this._sites[site.id] = null;
  },

  update: function() {

    for (var id in this._sites) {

      var mesh = this._markers[id];
      var site = this._sites[id];

      switch (site.type) {

        default: {  // point

          mesh.position.set(site.x, site.y, 0);
        }
      }
    }
  },

  get visible() { return this._origin.visible; },
  set visible(value) { this._origin.visible = !!value; },

  get origin() { return this._origin; }
};