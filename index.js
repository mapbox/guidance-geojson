var polyline = require('polyline');
var along = require('turf-along');
var lineDistance = require('turf-line-distance');
var turfBearing = require('turf-bearing');

module.exports = guidance;
module.exports.stylePrep = stylePrep;
module.exports.styleRoute = styleRoute;

/**
 * Convert a Mapbox Directions response to a GeoJSON FeatureCollection that can be styled with Mapbox Studio.
 *
 * @return {object} GeoJSON
 * @param {object} response - A Mapbox Directions response object.
 */
function guidance(response) {
    if (response.code) {
        return v5(response);
    } else {
        return v4(response);
    }
}

// Get a cloned/dereferenced geometry
function geom(geometry, precision) {
    return typeof geometry === 'string' ? polyline.toGeoJSON(geometry, precision) : JSON.parse(JSON.stringify(geometry));
}

function v4(response) {
    var geojson = { type:'FeatureCollection', features:[] };
    if (!response.routes.length) return geojson;

    var segments = [];
    var labels = [];
    var maneuvers = [];
    var waypoints = [];

    // Create waypoints
    waypoints.push({
        type: 'Feature',
        geometry: geom(response.origin.geometry, 6),
        properties: {
            type: 'waypoint',
            bearing: null,
            modifier: null,
            name: response.origin.properties.name || '',
            waypoint: 'first'
        }
    });
    waypoints.push({
        type: 'Feature',
        geometry: geom(response.destination.geometry, 6),
        properties: {
            type: 'waypoint',
            bearing: null,
            modifier: null,
            name: response.destination.properties.name || '',
            waypoint: 'last'
        }
    });


    // Generate segments
    segments.push({
        type: 'Feature',
        geometry: geom(response.routes[0].geometry, 6),
        properties: {
            type: 'segment',
            bearing: null,
            modifier: null,
            name: null,
            waypoint: null
        }
    });

    // Generate maneuver lines
    var last;
    response.routes[0].steps.forEach(function(step) {
        // Only generate maneuver lines for non-straight/slight modifiers
        if (step.way_name && last && last.way_name !== step.way_name) {
            var bearing = null;
            for (var i = 0; i < segments[0].geometry.coordinates.length; i++) {
                var prev = segments[0].geometry.coordinates[i-1];
                var next = segments[0].geometry.coordinates[i];
                var check = step.maneuver.location.coordinates;
                if (prev && next[0] === check[0] && next[1] === check[1]) {
                    bearing = turfBearing({
                        geometry: { type: 'Point', coordinates: prev }
                    }, {
                        geometry: { type: 'Point', coordinates: next }
                    });
                    bearing = Math.round(bearing/15)*15;
                    bearing = bearing < 0 ? bearing + 360 : bearing;
                    break;
                }
            }
            labels.push({
              type: 'Feature',
              geometry: step.maneuver.location,
              properties: {
                type: 'label',
                bearing: bearing,
                modifier: /left/.test(step.maneuver.type) ? 'left' :
                    /right/.test(step.maneuver.type) ? 'right' :
                    'other',
                name: step.way_name.match(/^([^\(]+)/)[1].trim(),
                waypoint: null
              }
            });
        }
        // Store previous step
        last = step;
    });

    geojson.features = segments.concat(labels).concat(waypoints);
    return geojson;
}

function v5(response) {
    var geojson = { type:'FeatureCollection', features:[] };
    if (!response.routes.length) return geojson;

    var segments = [];
    var labels = [];
    var maneuvers = [];
    var waypoints = [];

    // Create waypoints
    response.waypoints.forEach(function(waypoint, i) {
        waypoints.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: waypoint.location },
            properties: {
                type: 'waypoint',
                bearing: null,
                modifier: null,
                name: waypoint.name || '',
                waypoint: i === 0 ? 'first' :
                    i === response.waypoints.length - 1 ? 'last' :
                    null
            }
        });
    });

    // Generate maneuver lines
    response.routes[0].legs.forEach(function(leg) {
        var lastName;

        leg.steps.forEach(function(step, i) {
            if (!step.geometry) return;
            if (!step.maneuver.modifier) return;
            if (step.maneuver.modifier === 'straight') return;

            // Only generate maneuver lines for non-straight/slight modifiers
            if (lastName !== step.name || (/^(right|left)$/).test(step.maneuver.modifier)) {
                var geometry = geom(step.geometry);
                var bearing = Math.round(step.maneuver.bearing_before/15)*15;
                bearing = bearing < 0 ? bearing + 360 : bearing;

                var speed = (lineDistance({
                    type:'LineString',
                    geometry: geometry
                }, 'kilometers')*3600)/step.duration;

                var name = step.name;
                if (!name && leg.steps[i+1] && leg.steps[i+1].geometry && leg.steps[i+1].duration) {
                    var nextname = leg.steps[i+1].name;
                    var nextspeed = (lineDistance({
                        type:'LineString',
                        geometry: geom(leg.steps[i+1].geometry)
                    }, 'kilometers')*3600)/leg.steps[i+1].duration;
                    if (/^slight/.test(step.maneuver.modifier) && (nextspeed-speed) < -30) {
                        name = nextname ? 'To ' + nextname : 'Exit';
                    } else if (/^slight/.test(step.maneuver.modifier) && (nextspeed-speed) > 30) {
                        name = nextname ? 'To ' + nextname : 'Merge';
                    }
                }

                if (name && geometry.coordinates.length) {
                    labels.push({
                        type: 'Feature',
                        geometry: {
                          type: 'Point',
                          coordinates: geometry.coordinates[0]
                        },
                        properties: {
                          type: 'label',
                          bearing: bearing,
                          modifier: step.maneuver.modifier.replace(/ /g,'_'),
                          name: name,
                          waypoint: null
                        }
                    });
                    lastName = name;
                }
            }
        });
    });

    // Generate segments
    response.routes[0].legs.forEach(function(leg) {
        segments = segments.concat(leg.steps.reduce(function(joined, step) {
            if (!step.geometry || step.geometry.type !== 'LineString') return joined;
            var next = geom(step.geometry);
            joined.geometry.coordinates = joined.geometry.coordinates.concat(next.coordinates);
            return joined;
        }, {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: []
            },
            properties: {
                type: 'segment',
                bearing: null,
                modifier: null,
                name: null,
                waypoint: null
            }
        }));
    });

    geojson.features = segments.concat(maneuvers).concat(labels).concat(waypoints);
    return geojson;
}

/**
 * Prepare a Mapbox GL style for loading into Mapbox GL prior to having route data from guidance-geojson added. Useful for initializing a map prior to having a dynamic route added to it.
 *
 * @return {object} A Mapbox GL style object
 * @param {object} style - A Mapbox GL style object.
 * @param {string} [prefix=route] - Layer IDs matching this string prefix will be snagged for styling route data. Defaults to 'route'.
 */
function stylePrep(style, prefix) {
    // Clone style object
    style = JSON.parse(JSON.stringify(style));

    var routeLayers = [];
    prefix = prefix || 'route';

    // Stash layers and source ID to use on style metadata object
    style.metadata = style.metadata || {};
    style.metadata['guidanceRoute'] = routeLayers;

    // Filter layers to those not styling route data
    var filtered = [];
    style.layers.forEach(function(layer, i) {
        if (layer.id.indexOf(prefix) === 0) {
            routeLayers.push({
                layer: layer,
                before: style.layers[i-1] ? style.layers[i-1].id : undefined
            });
        } else {
            filtered.push(layer);
        }
    });
    style.layers = filtered;

    return style;
}

/**
 * Add guidance geojson from a route to a map for styling. The map style must already be prepared via the `stylePrep()` function.
 *
 * @param {object} mapboxgl - A reference to the Mapbox GL library.
 * @param {object} map - A Mapbox GL map object.
 * @param {object} route - A Mapbox Directions response (will be converted automatically) or guidance GeoJSON for such a route.
 */
function styleRoute(mapboxgl, map, route) {
    var style = map.getStyle();
    if (!style.metadata || !style.metadata.guidanceRoute) throw new Error('metadata.guidanceRoute not found. Did you run stylePrep() on your style object?');
    if (route.type !== 'FeatureCollection') route = guidance(route);

    map.addSource('route-guidance', new mapboxgl.GeoJSONSource({ data: route }));

    style.metadata.guidanceRoute.forEach(function(item) {
        item.layer['source'] = 'route-guidance';
        delete item.layer['source-layer'];
        map.addLayer(item.layer, item.before)
    });
}

