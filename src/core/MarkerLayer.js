/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

/**
 * The marker layer is responsible for drawing meshes that visualize site-
 * locations. We call this visualization-meshes markers for short.
 *
 * @constructor
 */
function MarkerLayer() {

  this._sites = {};  // (id -> site) map
  this._markers = {};  // (id -> marker) map

  this._origin = new THREE.Object3D();

  this._markerGeometry = new THREE.PlaneGeometry(1, 1);
  this._markerMaterial = new THREE.MeshBasicMaterial({
    color: MarkerLayer.style.color
  });

  this.visible = false;
}

MarkerLayer.style = {
  color: new THREE.Color(0, 0, 0),
  size: 5
};

MarkerLayer.prototype = {

  constructor: MarkerLayer,

  add: function(site) {

    if (this._sites.hasOwnProperty(site.id)) { return; }

    var marker = new THREE.Mesh(
      this._markerGeometry,
      this._markerMaterial
    );

    switch (site.type) {

      case (SiteType.line): {

        marker.scale.set(
          MarkerLayer.style.size,
          site.length(),
          1
        );

        break;
      }

      default: {  // point

        marker.scale.set(
          MarkerLayer.style.size,
          MarkerLayer.style.size,
          1
        );

        break;
      }
    }

    this._sites[site.id] = site;
    this._markers[site.id] = marker;
    this._origin.add(marker);
  },

  remove: function(site) {

    if (!this._sites.hasOwnProperty(site.id)) { return; }

    var marker = this._markers[site.id];
    this._origin.remove(marker);
    delete this._markers[site.id];
    delete this._sites[site.id];
  },

  /**
   * Updates the marker-mesh's location based on its site location.
   *
   * Call this if a site's position was changed.
   */
  update: function() {

    for (var id in this._sites) {

      var marker = this._markers[id];
      var site = this._sites[id];

      switch (site.type) {

        case (SiteType.line): {

          marker.rotation.setFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              site.direction()
            )
          );

          var center = {
            x: (site.a.x + site.b.x) / 2,
            y: (site.a.y + site.b.y) / 2
          };

          marker.position.set(center.x, center.y, 0);

          break;
        }

        default: {  // point

          marker.position.set(site.x, site.y, 0);
        }
      }
    }
  },

  get visible() { return this._origin.visible; },
  set visible(value) { this._origin.visible = !!value; },

  /**
   * Gets the 3d object hosting all of the markers.
   *
   * @returns {THREE.Object3D|*}
   */
  get origin() { return this._origin; }
};