'use strict';

var fs = require('fs');

var Monito = require('../lib/index');

const formatter = {
    state(data, chimp)  {
        console.log('* ' + data.message);
    },
    error(data) {
        console.log('! ' + data.message);
        if (data.err) {
            console.log(data.err);
        }
    }
};

process.on('SIGINT', function () {
    console.log('\n' + chalk.magenta.bold('Ok bye!\n'));
    process.exit();
});

let chimp = new Monito({
    init: (monito) => {
        monito.state = 'register';
    },
    states: {
        register: (monito, next) => {
            next(null, 'getProfile');
        },
        getProfile: (monito, next) => {
            next(null, {
                browse: 4
            }, 'shop');
        },
        browse: (monito, next) => {
            next(null, {
                browse: 6
            }, 'shop');
        },
        shop: (monito, next) => {
            next(null, 'logout');
        },
        logout: (monito, next) => {
            monito.stop();
            next();
        }
    }
});

chimp.on('report', function (data) {
    if (data.type && formatter[data.type]) {
        formatter[data.type](data, chimp);
    } else {
        console.log(data.message);
    }
});

chimp.start();
