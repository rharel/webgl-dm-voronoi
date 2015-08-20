(function() {

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
  
  
  /**
   * Describes a generic site. Concrete site types extend this class.
   *
   * @param id Unique site identifier
   * @param type Site type @see SiteType
   * @param color Color associated with this site
   *
   * @constructor
   */
  function Site(id, type, color) {
  
    this._id = id;
    this._type = type;
    this._color = color;
  }
  
  Site.prototype = {
  
    constructor: Site,
  
    get id() { return this._id; },
    get type() { return this._type; },
    get color() { return this._color; }
  };
  
  /**
   * Site type enumerator.
   *
   * We currently support the following sites: point and line.
   * @type {{point: number, line: number}}
   */
  var SiteType = { point: 0, line: 1 };
  
  
  /**
   * Describes a point voronoi site.
   *
   * @param id Site ID (supplied by Diagram)
   * @param x
   * @param y
   * @param radius Size of the distance mesh
   * @param geometry Point distance mesh geometry (shared among all point sites)
   * @param material three.js material
   *
   * @constructor
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
  
    /**
     * Gets the 3d object hosting this site's meshes.
     */
    origin: {
      get: function origin() { return this._mesh; }
    },
  
    /**
     * Gets/sets the distance mesh size. Setting this is the responsibility
     * of Diagram.
     */
    radius: {
      get: function radius() { return this._mesh.scale.x; },
  
      set: function radius(value) {
  
        this._mesh.scale.set(+value, +value, +value);
      }
    }
  });
  
  PointSite.prototype.constructor = PointSite;
  
  
  /**
   * Describes a line segment voronoi site.
   *
   * @param id Site ID (supplied by Diagram)
   * @param a Object with {x: y:}
   * @param b Object with {x: y:}
   * @param radius Size of the distance mesh
   * @param geometry Object with {endpoint: edge:} (shared among all line sites)
   * @param material three.js material
   *
   * @constructor
   */
  function LineSite(id, a, b, radius, geometry, material) {
  
    Site.call(this, id, SiteType.line, material.color);
  
    this._a = new THREE.Vector3(a.x, a.y, 0);
    this._b = new THREE.Vector3(b.x, b.y, 0);
  
    this._aProxy = LineSite._endpointProxy(this, '_a');
    this._bProxy = LineSite._endpointProxy(this, '_b');
  
    this._geometry = geometry;
  
    this._material = material;
  
    this._mesh = {
      endpointA: new THREE.Mesh(
        this._geometry.endpoint,
        this._material
      ),
  
      endpointB: new THREE.Mesh(
        this._geometry.endpoint,
        this._material
      ),
  
      edge: new THREE.Mesh(
        this._geometry.edge,
        this._material
      )
    };
  
    this._mesh.endpointA.scale.set(radius, radius, radius);
    this._mesh.endpointA.rotation.z = Math.PI;
  
    this._mesh.endpointB.scale.set(radius, radius, radius);
  
    this._mesh.edge.scale.set(radius, 1, radius);
  
    this._origin = new THREE.Object3D();
    this._origin.add(
      this._mesh.endpointA,
      this._mesh.endpointB,
      this._mesh.edge
    );
  
    this._updateMesh();
  }
  
  /**
   * Creates a proxy that links endpoint updates to mesh transform updates.
   *
   * @details
   *  We use this proxy to enable users to update line endpoint positions
   *  with the comfortable 'line.a.x = value' syntax and have the changes
   *  automatically trigger and mesh transform update.
   *
   *  Since there are two endpoints, a and b, we use one proxy creator to reduce
   *  code duplication.
   */
  LineSite._endpointProxy = function(self, property) {
  
    return {
  
      set: function(x, y) {
  
        self[property].x = +x;
        self[property].y = +y;
        self._updateMesh();
      },
  
      get x() { return self[property].x; },
      set x(value) {
  
        self[property].x = +value;
        self._updateMesh();
      },
  
      get y() { return self[property].y; },
      set y(value) {
  
        self[property].y = +value;
        self._updateMesh();
      }
    };
  };
  
  LineSite.edgeDistanceGeometry = function() {
  
    return GeometryExtensions.tent(2, 1, 1);
  };
  
  LineSite.endpointDistanceGeometry = function(nRadialSegments) {
  
    return GeometryExtensions.triangleFan(
      1, 1, Math.PI, nRadialSegments
    );
  };
  
  LineSite.prototype = Object.create(Site.prototype, {
  
    _updateMesh: {
      value: function() {
  
        var ab = new THREE.Vector3().subVectors(this._b, this._a);
        var length = ab.length();
  
        this._mesh.endpointB.position.y = length;
  
        this._mesh.edge.scale.y = length;
        this._mesh.edge.position.y = length / 2;
  
        // merged together //
  
        var abN = new THREE.Vector3(ab.x, ab.y, 0);
        abN.normalize();
  
        var q = new THREE.Quaternion();
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), abN);
  
        this._origin.rotation.setFromQuaternion(q);
        this._origin.position.set(this._a.x, this._a.y, 0);
      }
    },
  
    /**
     * Gets endpoint A controller.
     * You can use it to change the position of the endpoint.
     *
     * @returns Object with {x: y: set(x, y):}
     * @example
     *  var line = new LineSite(...);
     *  line.a.x = 1;  // set individual coordinate
     *  line.set(1, 2);  // set both x and y together
     */
    a: {
      get: function a() { return this._aProxy; }
    },
  
    b: {
      get: function b() { return this._bProxy; }
    },
  
    /**
     * Computes line segment length.
     */
    length: {
      value: function() {
  
        return (
          new THREE.Vector3()
            .subVectors(this._b, this._a)
            .length()
        );
      }
    },
  
    /**
     * Computes normalized line vector (from endpoint A to B).
     */
    direction: {
      value: function() {
  
        return (
          new THREE.Vector3()
            .subVectors(this._b, this._a)
            .normalize()
        );
      }
    },
  
    mesh: {
      get: function mesh() { return this._mesh; }
    },
  
    /**
     * Gets the 3d object hosting this site's meshes.
     */
    origin: {
      get: function origin() { return this._origin; }
    },
  
    /**
     * Gets/sets the distance mesh size. Setting this is the responsibility
     * of Diagram.
     */
    radius: {
      get: function radius() { return this._mesh.endpointA.scale.x; },
      set: function radius(value) {
  
        this._mesh.endpointA.scale.set(+value, +value, +value);
        this._mesh.endpointB.scale.set(+value, +value, +value);
  
        this._mesh.edge.scale.setX(+value);
        this._mesh.edge.scale.setZ(+value);
      }
    }
  });
  
  LineSite.prototype.constructor = LineSite;
  
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
  
  /**
   * The main class of the library. Responsible for initializing a drawing canvas
   * (from scratch or from an existing one) and exposes an interface for creating
   * voronoi sites.
   *
   * Currently we support the following sites: point, and line (segment).
   *
   * @param options
   *  An object with the following optional properties:
   *    canvas:
   *      If present, will render into this element. Otherwise, will create
   *      a new canvas. The library user needs to add it to the DOM him/herself.
   *
   *    width, height:
   *      Desired size of the canvas, ignored if the canvas option is available.
   *
   *    precision:
   *      Positive integer which controls diagram refinement. The higher, the more
   *      detailed will the distance-meshes be, and thus the more correct
   *      the rendering becomes.
   *
   *    markers:
   *      Boolean. Indicates whether the site markers are initially visible.
   *
   * @constructor
   */
  function Diagram(options) {
  
    options = _parseOptions(options);
  
    if (options.canvas === null) {
      this._canvas = _createCanvas(options.width, options.height);
    }
    else {
      this._canvas = options.canvas;
    }
  
    this._3d = new Context3D(this._canvas);
  
    this._precision = options.precision;
  
    this._sites = {};
    this._id = 0;
    this._nSites = 0;
  
    this._maxDistance = Math.max(this._canvas.width, this._canvas.height);
  
    this._pointDistanceGeometry = PointSite.distanceGeometry(this._precision);
  
    this._lineDistancGeometry = {
      edge: LineSite.edgeDistanceGeometry(),
      endpoint: LineSite.endpointDistanceGeometry(this._precision)
    };
  
    this._markerLayer = new MarkerLayer();
    this._markerLayer.visible = options.markers;
    this._3d.add(this._markerLayer.origin);
  
    function _parseOptions(options) {
  
      var defaultOptions = {
        canvas: null,
        width: 500, height: 500,
        precision: 16,
        markers: true
      };
  
      if (typeof options === 'undefined') {
        return defaultOptions;
      }
      else {
        options.canvas = options.canvas || null;
        options.width = +options.width || defaultOptions.width;
        options.height = +options.height || defaultOptions.height;
        options.precision = +options.precision || defaultOptions.precision;
        options.markers = !!options.markers;
  
        return options;
      }
    }
  
    function _createCanvas(width, height) {
  
      var canvas = document.createElement('canvas');
  
      canvas.width = width;
      canvas.height = height;
  
      return canvas;
    }
  }
  
  
  Diagram.prototype = {
  
    constructor: Diagram,
  
    _parseColor: function(color) {
      if (typeof color === 'string') {
         return new THREE.Color(color);
      }
      else {
        return new THREE.Color(color.r, color.g, color.b);
      }
    },
  
    /**
     * Creates a new point site.
  
     * @returns {PointSite}
     *  The object returned is a reference to the created site.
     *  Changing the reference properties will have immediate effect on the
     *  diagram.
     */
    point: function(x, y, color) {
  
      color = this._parseColor(color);
  
      var site = new PointSite(
        this._id++,
        x, y,
        this._maxDistance,
        this._pointDistanceGeometry,
        this._3d.material(color)
      );
  
      this._add(site);
  
      return site;
    },
  
    /**
     * Creates a new line site.
     *
     * @param a Object with {x: y:}
     * @param b Object with {x: y:}
     * @param color
     *  Either a css style string, or an object with {r:[0-1] g:[0-1] b:[0-1]}.
     *
     * @returns {LineSite}
     *  The object returned is a reference to the created site.
     *  Changing the reference properties will have immediate effect on the
     *  diagram.
     */
    line: function(a, b, color) {
  
      color = this._parseColor(color);
  
      var site = new LineSite(
        this._id++,
        a, b,
        this._maxDistance,
        this._lineDistancGeometry,
        this._3d.material(color)
      );
  
      this._add(site);
  
      return site;
    },
  
    _add: function(site) {
  
      this._sites[site.id] = site;
      this._nSites++;
  
      this._3d.add(site.origin);
  
      this._markerLayer.add(site);
    },
  
    /**
     * Removes a site from the diagram.
     *
     * @param id_or_site
     *  Either the site.id or the site object itself.
     *
     * @returns {boolean} True if the site was removed.
     */
    remove: function(id_or_site) {
  
      var id = (typeof id_or_site === 'number') ? id_or_site : id_or_site.id;
  
      if (this._sites.hasOwnProperty(id)) {
  
        var site = this._sites[id];
  
        this._markerLayer.remove(site);
  
        this._3d.remove(site.origin);
  
        delete this._sites[id];
        this._nSites--;
  
        return true;
      }
      else { return false; }
    },
  
    /**
     * Renders the diagram onto the canvas.
     */
    render: function() {
  
      if (this._markerLayer.visible) { this._markerLayer.update(); }
      this._3d.render();
    },
  
    /**
     * Resizes the diagram.
     *
     * Call this when the canvas' dimensions have changed.
     */
    resize: function() {
  
      this._maxDistance = Math.max(this._canvas.width, this._canvas.height);
  
      this._3d.resize();
  
      for (var id in this._sites) {
        this._sites[id].radius = this._maxDistance;
      }
    },
  
    /**
     * Gets the canvas tied to this.
     */
    get canvas() { return this._canvas; },
  
    /**
     * Gets the precision of this.
     */
    get precision() { return this._precision; },
  
    /**
     * Gets the number of sites (of all types together).
     *
     * @returns {number}
     */
    get nSites() { return this._nSites; },
  
    /**
     * Gets the marker layer object of this.
     *
     * @returns {MarkerLayer}
     */
    get markers() { return this._markerLayer; }
  };
  
  
  if (typeof window !== 'undefined') {
  
    window.Voronoi = {
      Diagram : Diagram,
      SiteType: SiteType
    };
  }
  

})();