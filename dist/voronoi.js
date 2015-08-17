(function() {

  /**
   * @author Raoul Harel
   * @license The MIT license (LICENSE.txt)
   * @copyright 2015 Raoul Harel
   * @url https://github.com/rharel/webgl-dm-voronoi
  */
  
  THREE.CylinderGeometry.Cone = function(radius, height, precision) {
  
    return new THREE.CylinderGeometry(0, radius, height, precision);
  };
  
  
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
  
  
  function Diagram(options) {
  
    options = _parseOptions(options);
  
    if (options.canvas === null) {
      this._canvas = _createCanvas(options.width, options.height);
    }
    else {
      this._canvas = options.canvas;
    }
  
    this._3D = new Context3D(this._canvas);
  
    this._precision = options.precision;
    this._distanceMeasure = options._distanceMeasure;
  
    this._sites = [];
  
    this._maxDistance = Math.max(this._canvas.width, this._canvas.height);
  
    this._pointDG = PointSite.distanceGeometry(
      this._maxDistance,
      this._precision,
      this._distanceMeasure
    );
  
  
    function _parseOptions(options) {
      var defaultOptions = {
        canvas: null,
        width: 500, height: 500,
        precision: 16,
        _distanceMeasure: Distance.euclidean
      };
  
      if (typeof options === 'undefined') {
        return defaultOptions;
      }
      else {
        options.canvas = options.canvas || null;
        options.width = +options.width || defaultOptions.width;
        options.height = +options.height || defaultOptions.height;
        options.precision = +options.precision || defaultOptions.precision;
        options._distanceMeasure = options._distanceMeasure ||
          defaultOptions._distanceMeasure;
  
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
  
    point: function(x, y, color) {
  
      if (typeof color === 'string') {
        color = new THREE.Color(color);
      }
      else {
        color = new THREE.Color(color.r, color.g, color.b);
      }
  
      var mesh = new THREE.Mesh(this._pointDG, this._3D.material(color));
      var site = new PointSite(x, y, mesh);
  
      this._sites.push(site);
      this._3D.add(mesh);
    },
  
    render: function() { this._3D.render(); },
  
    get canvas() { return this._canvas; },
  
    get precision() { return this._precision; },
    set precision(value) { this._precision = value; },
  
    get nSites() { return this._sites.length; }
  };
  
  
  var Distance = {
  
    euclidean: function(a, b) {
      return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    },
  
    manhattan: function(a, b) {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
  };
  
  
  function Site(type, mesh) {
  
    this._type = type;
    this._mesh = mesh;
  }
  
  Site.prototype = {
  
    constructor: Site,
  
    get type() { return this._type; },
    get color() { return this._mesh.material.color; }
  };
  
  var SiteType = { point: 0 };
  
  
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
  
  
  if (typeof window !== 'undefined') {
  
    window.Voronoi = {
      Diagram : Diagram,
      Distance: Distance,
      SiteType: SiteType
    };
  }
  

})();