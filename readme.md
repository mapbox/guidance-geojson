guidance-geojson
----------------
Project for generating guidance-specific labelling/route styling data for GL from Mapbox Directions responses.

```js
var guidanceGeoJSON = require('guidance-geojson');

var geojson = guidanceGeoJSON(directionsResponse);
// console.log(geojson);
```

### Styling Guidance GeoJSON

Guidance GeoJSON provides a FeatureCollection with the following feature types:

- `segments` are LineString features that together make up the route to be traveled.
- `labels` are Point features for maneuver points where the user needs to make a turn.
- `waypoints` are Point features for starting, final, or intermediate destinations.

Each feature has the following properties exposed for styling in Mapbox Studio:

property | segment | label | waypoint
--- | --- | --- | ---
`type` | `segment` | `label` | `waypoint`
`bearing` | `null` | `0-360` | `null`
`modifier` | `null` | TBD | `null`
`name` | `null` | Name of next road | Name of waypoint road
`waypoint` | `null` | `null` | `"first"|"last"|null`

@TODO: provide example Guidance GeoJSON file for styling in studio as a static route.

### Integrating Guidance GeoJSON dynamically with a Mapbox GL JS map

Once you have created your map style you can have it dynamically style a route. To do so, however, you will need to use the `stylePrep()` and `styleRoute()` methods to omit the layers in your style when loading your map and then apply those styles to your dynamic guidance GeoJSON once loaded:

```js
var guidanceGeoJSON = require('guidance-geojson');
var mapboxgl = require('mapbox-gl');
var directionsResponse = require('./stored-directions-response.json');

var map = new mapboxgl.Map({
    container: 'map',
    // Defers showing all layers from `style` beginning with `route`
    style: guidanceGeoJSON.stylePrep(style, 'route')
});

map.on('style.load', function () {
    var route = guidanceGeoJSON(directionsResponse);
    // Restores style layers and adjusts dynamically to style `route` GeoJSON
    guidanceGeoJSON.styleRoute(mapboxgl, map, route);
});
```

