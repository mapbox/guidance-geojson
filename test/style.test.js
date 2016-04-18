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
        'route-case@road-major',
        'route@route-case',
        'route-spacer@road-label-major',
        'route-maneuver-left@motorway-shields-interstate',
        'route-maneuver-right@route-maneuver-left'
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
                            'source-layer':'data'
                        },
                        before: 'road'
                    },
                    {
                        layer: {
                            id: 'route-label',
                            source:'test',
                            'source-layer':'data'
                        },
                        before: 'road-label'
                    }
                ]
            }
        };
    };
    map.addSource = function(id, source) {
        assert.equal(id, 'route-guidance', 'addSource: adds source with id=route-guidance');
        assert.equal(source instanceof mapboxgl.GeoJSONSource, true, 'addSource: adds GeoJSONSource');
    };
    map.addLayer = function(layer, before) {
        if (layer.id === 'route') {
            assert.equal(layer.source, 'route-guidance', 'layer.source = route-guidance');
            assert.equal(layer['source-layer'], undefined, 'layer.source-layer is unset');
            assert.equal(before, 'road', 'layer is added before id:road');
        } else if (layer.id === 'route-label') {
            assert.equal(layer.source, 'route-guidance', 'layer.source = route-guidance');
            assert.equal(layer['source-layer'], undefined, 'layer.source-layer is unset');
            assert.equal(before, 'road-label', 'layer is added before id:road-label');
        } else {
            assert.fail('unknown layer ' + layer.id);
        }
    };

    styleRoute(mapboxgl, map, route);

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
                            'source-layer':'data'
                        },
                        before: 'road'
                    },
                    {
                        layer: {
                            id: 'route-label',
                            source:'test',
                            'source-layer':'data'
                        },
                        before: 'road-label'
                    }
                ]
            }
        };
    };
    map.addSource = function(id, source) {
        assert.equal(id, 'route-guidance', 'addSource: adds source with id=route-guidance');
        assert.equal(source instanceof mapboxgl.GeoJSONSource, true, 'addSource: adds GeoJSONSource');
    };
    map.addLayer = function(layer, before) {
        if (layer.id === 'route') {
            assert.equal(layer.source, 'route-guidance', 'layer.source = route-guidance');
            assert.equal(layer['source-layer'], undefined, 'layer.source-layer is unset');
            assert.equal(before, 'road', 'layer is added before id:road');
        } else if (layer.id === 'route-label') {
            assert.equal(layer.source, 'route-guidance', 'layer.source = route-guidance');
            assert.equal(layer['source-layer'], undefined, 'layer.source-layer is unset');
            assert.equal(before, 'road-label', 'layer is added before id:road-label');
        } else {
            assert.fail('unknown layer ' + layer.id);
        }
    };

    styleRoute(mapboxgl, map, route);

    assert.end();
});

