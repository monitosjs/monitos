'use strict';

const Benchmark = require('benchmark');

const Monito = require('../lib/monito');

const states = {
    a: function (next) {
        next(null, 'b');
    },
    b: function (next) {
        next(null, 'c');
    },
    c: function (next) {
        next(null, 'd');
    },
    d: function (next) {
        next();
    }
};

const suite = new Benchmark.Suite; // jshint ignore:line

suite.add('default', {
    defer: true,
    fn: function (deferred) {
        let chimp = new Monito({ states: states, initialState: 'a' });
        chimp.on('end', function () {
            deferred.resolve();
        });
        chimp.start();
    }
}).on('error', function(err) {
    console.log('ERROR');
    console.log(err);
}).on('cycle', function(event) {
    console.log(String(event.target));
}).on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run({ async: true });

module.exports = suite;