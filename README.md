[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com)

# Installation

Install via bower: `bower install rharel/webgl-dm-voronoi`

The `dist/` directory contains both a normal (`voronoi.js`) as well as a minified version of the library (`voronoi.min.js`).
Include in the browser using `<script src="path/to/voronoi.min.js"></script>`

# Usage

## Create
```javascript
var voronoi = new Voronoi.Diagram(options);
```

`options` is an object with (optionally) the following properties:

|Name|Default|Description|
|:--:|:-----------:|:----------|
| canvas | null | If you want to draw onto an existing canvas, supply its dom element in this option.
| width | 500 | In case `canvas` option was null, the diagram will create its own canvas element as wide as this.
| height | 500 | Analogous to the `width` option above.
| precision | 16 | Positive integer which controls the level of detail of the distance mesh. The higher, the more detailed will the mesh be, producing a better rendering at the cost of performance.
| markers | true | Boolean indicating whether site markers are initially visible.

## Populate

Currently, we support two voronoi site types: points and line segments.

Something that is common to all site instantiation methods is that the returned value is a reference to the created site object. You can use it to dynamically change the site's properties (i.e. position in the case of a point-site or the position of the endpoints of a line-site).

Each instantiation method will also take a `color` parameter, this will be the color of the rendered voronoi cell of the created site. The value passed can be either a css color string or an object `{r:, g:, b:}` with channel values in the interval [0, 1].

### Points

Instantiate points like so:
```javascript
var p = voronoi.point(x, y, color);
```

You may change the position of a point site:
```javascript
p.x = newX;
p.y = newY;
```

### Line segments

Instantiate a line segment like so:
```javascript
var w = voronoi.line(a = {x:, y:}, b = {x:, y:}, color)
```

You may hange the position of the endpoints of a line site:
```javascript
// Individual axis
line.a.x = ... // new x for endpoint A
line.b.y = ... // new y for endpoint B

// Simultaneously
line.a.set(x, y);
```

### Removing sites

You may remove a site from the diagram by invoking `remove()` in one of two ways:
```javascript
voronoi.remove(site);  // pass in the site object itself
voronoi.remove(site.id);  // pass in the site's ID
```

## Render

```javascript
voronoi.render();
```

### Canvas resizing

If the canvas' `width` or `height` has changed, you should call
```javascript
voronoi.resize()
```

This will read the new size of the canvas and adjust the GL viewport and camera projection matrix accordingly.

### Site visualization

If you wish to render simple markers visualizing where the voronoi site shapes (e.g. points or line segments) are, you can control their visibility by setting:
```javascript
voronoi.markers.visible = true;
```

# Demo

Under [test/integration](test/integration) you can view some basic usage cases. A more complex demonstration can be viewed under [demo/](demo/)

# License

This software is licensed under the **MIT License**. See the [LICENSE](LICENSE.txt) file for more information.
