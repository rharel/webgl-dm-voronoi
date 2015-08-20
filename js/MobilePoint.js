/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function MobilePoint(site, velocity, boundingBox) {

  this._site = site;
  this._velocity = velocity;
  this._bbox = boundingBox;
}

MobilePoint.prototype = {

  constructor: MobilePoint,

  _bounce: function(axis, value) {

    if (value < this._bbox.min[axis]) {

      this._velocity[axis] = -this._velocity[axis];
      return this._bbox.min[axis];
    }

    else if (value > this._bbox.max[axis]) {

      this._velocity[axis] = -this._velocity[axis];
      return this._bbox.max[axis];
    }

    else { return value; }
  },

  _bounceX: function(value) { return this._bounce('x', value); },
  _bounceY: function(value) { return this._bounce('y', value); },

  step: function(dt) {

    var x = this._site.x + this._velocity.x * dt;
    var y = this._site.y + this._velocity.y * dt;

    x = this._bounceX(x);
    y = this._bounceY(y);

    this._site.x = x;
    this._site.y = y;
  },

  get site() { return this._site; },

  get x() { return this._site.x; },
  get y() { return this._site.y; }
};