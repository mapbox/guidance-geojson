var tape = require('tape');
var exec = require('child_process').exec;

tape('guidance-geojson: usage', function(assert) {
    exec(__dirname + '/../bin/guidance-geojson.js', function(err, stdout, stderr) {
        assert.equal(err && err.code, 1, 'exits 1 without arg');
        assert.equal(stdout.trim(), 'Usage: guidance-geojson <file.json> [--offset=num in km]', 'prints usage');
        assert.end();
    });
});

tape('guidance-geojson: output', function(assert) {
    exec(__dirname + '/../bin/guidance-geojson.js ' + __dirname + '/fixtures/v4-sf.json', function(err, stdout, stderr) {
        assert.ifError(err, 'exits 0 with arg');
        var output = JSON.parse(stdout.trim());
        assert.equal(typeof output, 'object', 'output: geojson object');
        assert.equal(output.type, 'FeatureCollection', 'output: geojson.type');
        assert.end();
    });
});

