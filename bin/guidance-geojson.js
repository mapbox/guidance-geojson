#!/usr/bin/env node

var guidance = require('../index.js');
var argv = require('minimist')(process.argv);

if (argv._.length < 3) {
    console.log('Usage: guidance-geojson <file.json>');
    process.exit(1);
}

var response = JSON.parse(require('fs').readFileSync(argv._[2]));
console.log(JSON.stringify(guidance(response), null, 2));
