'use strict';

const d20 = require('d20');

module.exports = {
    d20: (difficulty) => d20.roll('d20') >= difficulty
};
