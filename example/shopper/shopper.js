'use strict';

var request = require('request');

var server = require('./server');

const Monito = require('../../lib/monito');

const baseRequestOptions = {
    baseUrl: 'http://localhost:8080/',
    method: 'get',
    json: true,
    headers: {
        'Content-Type': 'application/json',
        Accepts: 'application/json'
    },
    pool: {
        maxSockets: 10240
    },
    gzip: true,
    time: true
};

const baseRequest = request.defaults(baseRequestOptions);

class Shopper extends Monito {

    constructor(states, startState) {
        super(states, startState);
    }

    call(options, done) {
        baseRequest(options, (err, res, body) => {
            done(err, body);
        });
    }

    register(done) {
        this.call({
            method: 'post',
            url: '/register'
        }, done);
    }

    getProfile(done) {
        this.call({ url: '/profile' }, done);
    }

    browse(done) {
        this.call({ url: '/browse' }, done);
    }

    shop(done) {
        this.call({ url: '/basket' }, done);
    }
}

const states = {
    register: function (next) {
        this.register((err/*, data*/) => {
            next(err, 'getProfile');
        });
    },
    getProfile: function (next) {
        this.getProfile((err/*, data*/) => {
            next(err, {
                browse: 4
            }, 'shop');
        });
    },
    browse: function (next) {
        this.browse((err/*, data*/) => {
            next(err, {
                browse: (/* monito */) => 6
            }, 'shop');
        });
    },
    shop: function (next) {
        this.register((err/*, data*/) => {
            next(err, 'logout');
        });
    },
    logout: function (next) {
        // next(null, 'register'); -- Uncomment to have it running forever
        next();
    }
};

let chimp = new Shopper(states, 'register');

chimp.on('error', function (data) {
    console.log('An error has occurred in state ' + data.currentState);
    console.log(data.err);
});

chimp.on('transition', function (data) {
    console.log(data.previousState + ' -> ' + data.nextState);
});

chimp.on('end', function (data) {
    console.log('We stop at ' + data.finalState + '. Bye!');
    server.close();
});

chimp.start();
