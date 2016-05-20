# Introduction to Creating a Guidance Style

The `guidance-geojson` repository offers tools for creating route-specific map styling from [Mapbox Directions API](https://www.mapbox.com/api-documentation/#directions). In order to pass route information into the style dynamically for visualization, the style must contain route styling layers. An example of a guidance-compatible style can be found in [`docs/style.json`](www.github.com/mapbox/guidance-geojson/blob/master/docs/style.json). If you'd like to create your own, here are a few steps to get you started.

# Setting Up Your Style

The route styling layers allow you to customize the appearance of your route. They may contain elements such as a route line, maneuver instructions, or street names. To start, you'll need to create a sample route to upload into [Mapbox Studio](https://www.mapbox.com/mapbox-studio/). This sample route is for development purposes only -- it gives you content to visulize so you can make design decisions, but may ultimately be overwritten with another route.

### Creating a Sample Route

1. Use the main module export in [`index.js`](www.github.com/mapbox/guidance-geojson/blob/master/index.js) to create a GeoJSON from a sample directions API response:

```js
var guidanceGeoJSON = require('guidance-geojson');
var geojson = guidanceGeoJSON(directionsResponse);
```

2. Upload the resultant GeoJSON output to Mapbox Studio as a tileset:

![upload](https://cloud.githubusercontent.com/assets/6913048/15443340/925369e0-1eb5-11e6-8428-8b0f88855f49.png)
