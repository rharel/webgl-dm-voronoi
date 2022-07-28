[![Bower version](https://badge.fury.io/bo/webgl-dm-voronoi.svg)](http://badge.fury.io/bo/webgl-dm-voronoi)
[![Build Status](https://travis-ci.org/rharel/webgl-dm-voronoi.svg)](https://travis-ci.org/rharel/webgl-dm-voronoi)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com)

# What is this?

A live demo is worth a thousand words, so [here it is](http://rharel.github.io/webgl-dm-voronoi/). This is a voronoi diagram plotting library that takes advantage of the GPU pipeline in order to convert meshes into voronoi diagrams. A paper explaining the method used can be viewed [here](https://files.ifi.uzh.ch/vmml/SummerSeminars2010/PaperWriting/papers/p277-hoff.pdf).

This implementation supports point and line-segment voronoi sites.

# Installation

Install via bower: `bower install webgl-dm-voronoi`

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

If you use an existing canvas, just pass its DOM element in the `canvas` option. Otherwise, you will need to add the canvas the voronoi diagram created to the DOM yourself:

```javascript
document.appendChild(voronoi.canvas);
```

## Populate

Currently, we support two voronoi site types: points and line segments.

Something that is common to all site instantiation methods is that the returned value is a reference to the created site object. You can use it to dynamically change the site's properties (i.e. position in the case of a point-site or the position of the endpoints of a line-site).

Each instantiation method will also take a `color` parameter, this will be the color of the rendered voronoi cell of the created site. The value passed can be either a css color string or an object `{r:, g:, b:}` with channel values in the interval [0, 1].

Every site gives you read access to its unique id via `site.id` (integer), its associated color `site.color` (`{r:, g:, b:}`) and its type `site.type` (`SiteType.point` or `SiteType.line`). 

### Points

Instantiate points like so:
```javascript
var p = voronoi.point(x, y, color);
```

You may change the position of a point site:
```javascript
p.x = ...  // new x;
p.y = ...  // new y;
```

### Line segments

Instantiate a line segment like so:
```javascript
var line = voronoi.line(a = {x:, y:}, b = {x:, y:}, color)
```

You may change the position of the endpoints:
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

Under [test/integration](test/integration) you can view some basic usage cases. A more complex demo can be seen live [here](http://rharel.github.io/webgl-dm-voronoi/).

# License

This software is licensed under the **MIT License**. See the [LICENSE](LICENSE.txt) file for more information.
