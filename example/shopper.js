'use strict';

const Monito = require('../lib/monito');

class Shopper extends Monito {

    constructor(states, startState) {
        super(states, startState);
    }

    call(options, done) {
        // Simulate a HTTP call to a backend server
        setTimeout(done, 200);
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

let chimp = new Shopper({ states: states, initialState: 'register' });

chimp.on('error', function (data) {
    console.log('An error has occurred in state ' + data.currentState);
    console.log(data.err);
});

chimp.on('transition', function (data) {
    console.log(data.previousState + ' -> ' + data.nextState);
});

chimp.on('end', function (data) {
    console.log('We stop at ' + data.finalState + '. Bye!');
});

chimp.start();
