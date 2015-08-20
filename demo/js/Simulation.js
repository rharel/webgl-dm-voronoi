/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function Simulation(voronoi, nPointsLimit, velocityBounds, stepInterval) {

  this._voronoi = voronoi;

  this._velocityBounds = velocityBounds;

  this._nPointsLimit = nPointsLimit;
  this._points = [];
  this._boundingBox = {
    min: {x: 0, y: 0},
    max: {
      x: this._voronoi.canvas.width,
      y: this._voronoi.canvas.height
    }
  };

  this._stepInterval = stepInterval;
  this._running = false;
  this._lastUpdate = new Date();
  this._renderPending = true;

  for (var i = 0; i < nPointsLimit.min; ++i) { this.spawn(); }

  this._render();  // initial render
}

Simulation.prototype = {

  constructor: Simulation,

  spawn: function() {

    if (this._points.length >= this._nPointsLimit.max) { return false; }

    var site = this._voronoi.point(
      Random.inRange(this._boundingBox.min.x, this._boundingBox.max.x),
      Random.inRange(this._boundingBox.min.y, this._boundingBox.max.y),
      Random.color()
    );

    var velocity = {
      x: Random.inRange(
        this._velocityBounds.min,
        this._velocityBounds.max
      ),
      y: Random.inRange(
        this._velocityBounds.min,
        this._velocityBounds.max
      )
    };

    this._points.push(
      new MobilePoint(site, velocity, this._boundingBox)
    );

    return true;
  },

  despawn: function() {

    if (this._points.length <= this._nPointsLimit.min) { return false; }

    var site = this._points.pop().site;
    this._voronoi.remove(site);

    return true;
  },

  _step: function() {

    var now = new Date();
    var dt = (now - this._lastUpdate) / 1000;

    this._points.forEach(function(p) {
      p.step(dt);
    });

    this._lastUpdate = now;
    this._renderPending = true;

    if (this._running) {
      setTimeout(this._step.bind(this), this._stepInterval);
    }
  },

  _render: function() {

    if (this._renderPending) {

      if (this._voronoi.markers.visible) {
        this._voronoi.markers.update();
      }

      this._voronoi.render();
      this._renderPending = false;
    }

    if (this._running) {
      requestAnimationFrame(this._render.bind(this));
    }
  },

  start: function() {

    if (this._running) { return; }

    this._running = true;
    this._lastUpdate = new Date();
    this._step();
    this._render();
  },

  stop: function() {

    this._running = false;
  },

  get boundingBox() { return this._boundingBox; }
};