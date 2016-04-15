var fs = require('fs');
var tape = require('tape');
var guidanceGeojson = require('../index');

tape.skip('convert directions v5 response to geojson', function(assert) {
    var input = JSON.parse(fs.readFileSync(__dirname + '/fixtures/v5-sf.json'));
    var output = guidanceGeojson(input);

    var segments = output.features.filter(function(f) {
        return f.properties.type === 'segment';
    });
    assert.equal(segments.length, 1, 'has 1 segment feature');
    assert.deepEqual(Object.keys(segments[0].properties), [ 'type', 'bearing', 'modifier', 'name', 'waypoint' ], 'has guidance keys');

    var labels = output.features.filter(function(f) {
        return f.properties.type === 'label';
    }).map(function(f) {
        return f.properties.name + '@' + f.properties.bearing;
    });
    assert.deepEqual(labels, [
        'US 101@180',
        'James Lick Freeway@165',
        'Bayshore Boulevard@165',
        'Geneva Avenue@195'
    ], 'has all labels');

    var waypoints = output.features.filter(function(f) {
        return f.properties.type === 'waypoint';
    });
    assert.deepEqual(waypoints[0].properties, {
        bearing: null,
        modifier: null,
        name: '10th Street',
        type: 'waypoint',
        waypoint: 'first'
    }, 'has first waypoint');
    assert.deepEqual(waypoints[1].properties, {
        bearing: null,
        modifier: null,
        name: 'Geneva Avenue',
        type: 'waypoint',
        waypoint: 'last'
    }, 'has last waypoint');

    assert.end();
});

tape('convert directions v4 response to geojson', function(assert) {
    var input = JSON.parse(fs.readFileSync(__dirname + '/fixtures/v4-sf.json'));
    var output = guidanceGeojson(input);

    var segments = output.features.filter(function(f) {
        return f.properties.type === 'segment';
    });
    assert.equal(segments.length, 1, 'has 1 segment feature');
    assert.deepEqual(Object.keys(segments[0].properties), [ 'type', 'bearing', 'modifier', 'name', 'waypoint' ], 'has guidance keys');

    var labels = output.features.filter(function(f) {
        return f.properties.type === 'label';
    }).map(function(f) {
        return f.properties.name + '@' + f.properties.bearing;
    });
    assert.deepEqual(labels, [
        'US 101@180',
        'James Lick Freeway@165',
        'Bayshore Boulevard@165',
        'Geneva Avenue@195'
    ], 'has all labels');

    var waypoints = output.features.filter(function(f) {
        return f.properties.type === 'waypoint';
    });
    assert.deepEqual(waypoints[0].properties, {
        bearing: null,
        modifier: null,
        name: '10th Street',
        type: 'waypoint',
        waypoint: 'first'
    }, 'has first waypoint');
    assert.deepEqual(waypoints[1].properties, {
        bearing: null,
        modifier: null,
        name: 'Geneva Avenue',
        type: 'waypoint',
        waypoint: 'last'
    }, 'has last waypoint');

    assert.end();
});

