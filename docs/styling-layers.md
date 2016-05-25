# Introduction

The `guidance-geojson` repository offers tools for creating route-specific map styling from [Mapbox Directions API](https://www.mapbox.com/api-documentation/#directions). To pass route information into the style dynamically for visualization, the style must contain route-specific styling layers. An example of a guidance-compatible style can be found in [docs/style.json](www.github.com/mapbox/guidance-geojson/blob/master/docs/style.json). If you'd like to create your own, here are steps to get you started.

# Creating a Guidance Style

Route layers allow you to customize the appearance of your Directions API response in a Mapbox GL JS map. They may contain elements such as a route line, maneuver markers, or maneuver names. To start, you'll need to create a sample route to upload into [Mapbox Studio](https://www.mapbox.com/mapbox-studio/). This sample route is for development purposes only – it gives you content to visualize so you can make design decisions, but will ultimately be overwritten dynamically with the route you specify.

### Creating a Sample Route

1\. Use the main module export in [index.js](www.github.com/mapbox/guidance-geojson/blob/master/index.js) to create a GeoJSON object from a sample directions API response:

```js
var guidanceGeoJSON = require('guidance-geojson');
var geojson = guidanceGeoJSON(directionsResponse);
```

2\. Upload the resultant GeoJSON output to Mapbox Studio as a tileset.

![upload](https://cloud.githubusercontent.com/assets/6913048/15443340/925369e0-1eb5-11e6-8428-8b0f88855f49.png)

### Creating a Guidance Style

1\. Create a new style.

![new_style](https://cloud.githubusercontent.com/assets/6913048/15550952/b30eb7aa-2281-11e6-87eb-beefdf0a325c.png)

2\. Add route layers using the route tileset you uploaded in step #2 above as a data source.

![add_layer](https://cloud.githubusercontent.com/assets/6913048/15549248/bcd709ca-2279-11e6-8661-c22a8a0f8c95.png)

3\. Select the data you want to style in the **Filter** section. Create the layer.

![style_data](https://cloud.githubusercontent.com/assets/6913048/15550767/f4e1b534-2280-11e6-8891-823123187ca8.png)

4\. For each layer containing route data, use the same string at the beginning of your layer names. For example, if you have 2 layers for styling route components — 1 for the route line, 1 for maneuver markers — you could call them `route-line` and `route-maneuvers`, respectively.

![layer_name](https://cloud.githubusercontent.com/assets/6913048/15550891/7b74d266-2281-11e6-8975-3daa0e56694d.png)

5\. Once you have styled your route layer(s), publish your style.

### Integrating a Guidance Style with a Mapbox GL JS Map

1\. Set up your dependencies.

```js
var guidanceGeoJSON = require('guidance-geojson');
var mapboxgl = require('mapbox-gl');
var directionsResponse = require('./stored-directions-response.json');
```

2\. Initialize your map using the `guidanceGeoJSON.stylePrep()` function for the style attribute. `guidanceGeoJSON.stylePrep()` takes 2 parameters – your custom style object, and the naming prefix used in the route layers. For example, if you called our route layers `route-line` and `route-maneuvers`, you'd want to pass `route` as the prefix parameter.

```js
var map = new mapboxgl.Map({
    container: 'map',
    // Defers showing all layers from `style` beginning with `route`
    style: guidanceGeoJSON.stylePrep(style, 'route')
});
```

3\. Use the `map.on('style.load', function() )` with `guidance.GeoJSON.styleRoute()` to restore the style layers when the map style has finished loading. In this step, the sample route used above for styling purposes is replaced by the `route` parameter you provide.

```js
map.on('style.load', function () {
    var route = guidanceGeoJSON(directionsResponse);
    // Restores style layers and adjusts dynamically to style `route` GeoJSON
    guidanceGeoJSON.styleRoute(mapboxgl, map, route);
});
```
