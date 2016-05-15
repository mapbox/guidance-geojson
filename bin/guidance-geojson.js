#!/usr/bin/env node

var guidance = require('../index.js');
var argv = require('minimist')(process.argv);

if (argv._.length < 3) {
    console.log('Usage: guidance-geojson <file.json> [--offset=num in km]');
    process.exit(1);
}

var options = {};
if (argv.offset) {
    options.offset = parseFloat(argv.offset);
}

var response = JSON.parse(require('fs').readFileSync(argv._[2]));
console.log(JSON.stringify(guidance(response, options), null, 2));
