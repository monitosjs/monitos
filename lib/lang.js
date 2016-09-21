'use strict';

const d20 = require('d20');
const util = require('util');

module.exports = {
    inspect: something => console.log(util.inspect(something, { depth: null, colors: true })),
    roll: d20.roll,
    savingThrow: threshold => d20.roll('d20') >= threshold,
    s: what => what !== 1 ? 's' : ''
};
