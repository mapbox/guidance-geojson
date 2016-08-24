var fs = require('fs');
var tape = require('tape');
var stylePrep = require('../index').stylePrep;
var styleRoute = require('../index').styleRoute;

tape('stylePrep', function(assert) {
    var style = JSON.parse(JSON.stringify(require('./fixtures/style-route.json')));

    assert.deepEqual(style.layers.length, 24, 'before: has 24 layers');
    assert.deepEqual(style.layers.map(function(l) { return l.id; }), [
        'background',
        'landuse',
        'landuse-sand',
        'water',
        'building',
        'building-top',
        'road-minor-case',
        'road-extra-case',
        'road-extra',
        'road-minor',
        'tunnel-major-case',
        'tunnel-major',
        'road-major-case',
        'road-major',
        'route-case',
        'route',
        'road-label-extra',
        'road-label-minor',
        'road-label-major',
        'route-spacer',
        'motorway-shields-other',
        'motorway-shields-interstate',
        'route-maneuver-left',
        'route-maneuver-right'
    ], 'before: has correct layer IDs');
    assert.deepEqual(style.metadata.guidanceRoute, undefined, 'before: no guidanceRoute metadata');

    style = stylePrep(style);
    assert.deepEqual(style.layers.length, 19, 'after: has 19 layers');
    assert.deepEqual(style.layers.map(function(l) { return l.id; }), [
        'background',
        'landuse',
        'landuse-sand',
        'water',
        'building',
        'building-top',
        'road-minor-case',
        'road-extra-case',
        'road-extra',
        'road-minor',
        'tunnel-major-case',
        'tunnel-major',
        'road-major-case',
        'road-major',
        'road-label-extra',
        'road-label-minor',
        'road-label-major',
        'motorway-shields-other',
        'motorway-shields-interstate',
    ], 'after: has correct layer IDs');
    assert.deepEqual(style.metadata.guidanceRoute.map(function(l) { return l.layer.id + '@' + l.before; }), [
        'route-case@route',
        'route@road-label-extra',
        'route-spacer@motorway-shields-other',
        'route-maneuver-left@route-maneuver-right',
        'route-maneuver-right@undefined'
    ], 'after: guidanceRoute has correct layer IDs');
    assert.end();
});

tape('styleRoute-errors', function(assert) {
    assert.throws(function() {
        styleRoute({}, {getStyle:function() { return {}; }}, {});
    }, /metadata.guidanceRoute not found/, 'throws without metadata');

    assert.throws(function() {
        styleRoute({}, {getStyle:function() { return { metadata:{} }; }}, {});
    }, /metadata.guidanceRoute not found/, 'throws without metadata.guidanceRoute');

    assert.end();
});

tape('styleRoute-geojson', function(assert) {
    var route = {
        type: 'FeatureCollection',
        features: []
    };
    var mapboxgl = {};
    var map = {};
    map.getStyle = function() {
        return {
            metadata: {
                guidanceRoute: [
                    {
                        layer: {
                            id: 'route',
                            source:'test',
                            'source-layer':'data',
                            layout: {
                                'line-join': 'miter'
                            },
                            paint: {
                                'line-color': '#fff'
                            }
                        },
                        before: 'road'
                    },
                    {
                        layer: {
                            id: 'route-case',
                            ref: 'route',
                            paint: {
                                'line-color': '#000'
                            }
                        },
                        before: 'road-label'
                    }
                ]
            }
        };
    };
    map.addSource = function(id, source) {
        assert.equal(id, 'route-guidance', 'addSource: adds source with id=route-guidance');
        assert.equal(source.data.type, 'FeatureCollection', 'geojson data provided to GeoJSONSource constructor');;
    };

    var added = [];
    map.addLayer = function(layer, before) {
        added.push({layer:layer, before:before});
    };

    styleRoute(mapboxgl, map, route);

    assert.equal(added.length, 2, 'adds 2 layers');

    assert.deepEqual(added[0].layer.id + '@' + added[0].before, 'route-case@road-label', 'adds route-case before road-label');
    assert.deepEqual(added[0].layer, {
        id: 'route-case',
        paint: { 'line-color': '#000' },
        layout: { 'line-join': 'miter' },
        source: 'route-guidance'
    }, 'adds route-case layer with ref resolved');

    assert.deepEqual(added[1].layer.id + '@' + added[1].before, 'route@road', 'adds route before road');
    assert.deepEqual(added[1].layer, {
        id: 'route',
        paint: { 'line-color': '#fff' },
        layout: { 'line-join': 'miter' },
        source: 'route-guidance'
    }, 'adds route layer');

    assert.end();
});

tape('styleRoute-route', function(assert) {
    var route = require('./fixtures/v4-sf.json');
    var mapboxgl = {};
    mapboxgl.GeoJSONSource = function(options) {
        assert.equal(options.data.type, 'FeatureCollection', 'geojson data provided to GeoJSONSource constructor');
    };
    var map = {};
    map.getStyle = function() {
        return {
            metadata: {
                guidanceRoute: [
                    {
                        layer: {
                            id: 'route',
                            source:'test',
                            'source-layer':'data',
                            layout: {
                                'line-join': 'miter'
                            },
                            paint: {
                                'line-color': '#fff'
                            }
                        },
                        before: 'road'
                    },
                    {
                        layer: {
                            id: 'route-case',
                            ref: 'route',
                            paint: {
                                'line-color': '#000'
                            }
                        },
                        before: 'road-label'
                    }
                ]
            }
        };
    };
    map.addSource = function(id, source) {
        assert.equal(id, 'route-guidance', 'addSource: adds source with id=route-guidance');
        assert.equal(source.data.type, 'FeatureCollection', 'geojson data provided to GeoJSONSource constructor');
    };

    var added = [];
    map.addLayer = function(layer, before) {
        added.push({layer:layer, before:before});
    };

    styleRoute(mapboxgl, map, route);

    assert.equal(added.length, 2, 'adds 2 layers');

    assert.deepEqual(added[0].layer.id + '@' + added[0].before, 'route-case@road-label', 'adds route-case before road-label');
    assert.deepEqual(added[0].layer, {
        id: 'route-case',
        paint: { 'line-color': '#000' },
        layout: { 'line-join': 'miter' },
        source: 'route-guidance'
    }, 'adds route-case layer with ref resolved');

    assert.deepEqual(added[1].layer.id + '@' + added[1].before, 'route@road', 'adds route before road');
    assert.deepEqual(added[1].layer, {
        id: 'route',
        paint: { 'line-color': '#fff' },
        layout: { 'line-join': 'miter' },
        source: 'route-guidance'
    }, 'adds route layer');

    assert.end();
});

