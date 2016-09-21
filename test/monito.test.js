'use strict';

const expect = require('chai').expect;

const Monito = require('../lib/monito');

describe('Monitos', function () {

    describe('Happy flows', function () {

        it('Runs a state machine with no random transitions', function (next) {
            let chimp = new Monito({
                init: (monito) => {
                    monito.state = 'register';
                },
                states: {
                    register: (monito, next) => {
                        next(null, 'getProfile');
                    },
                    getProfile: (monito, next) => {
                        next(null, 'browse');
                    },
                    browse: (monito, next) => {
                        next(null, 'shop');
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
            chimp.start();
            next();
        });

        it('Runs a state machine with random transitions', function (next) {
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
                        next();
                    }
                }
            });
            chimp.start();
            next();
        });
    });

    describe('Unhappy flows', function () {

        it('Handles errors', function (next) {
            let chimp = new Monito({
                init: (monito) => {
                    monito.state = 'register';
                },
                states: {
                    register: (monito, next) => {
                        next(new Error('Something went wrong'));
                    }
                }
            });
            chimp.start();
            // TODO: Test the error
            next();
        });

        it('Requires the argument "options"', function (next) {
            var fn = function () {
                new Monito();
            };
            expect(fn).to.throw(Error, /No options specified/);
            next();
        });

        it('Requires the argument "options.states"', function (next) {
            var fn = function () {
                new Monito({
                    foo: 'bar'
                });
            };
            expect(fn).to.throw(Error, /Missing mandatory option "states"/);
            next();
        });

        it('Requires a default next state when there are random transitions', function (next) {
            var fn = function () {
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
                                browse: 20
                            });
                        },
                        shop: (monito, next) => {
                            next();
                        }
                    }
                });
                chimp.start();
            };
            expect(fn).to.throw(Error, /There is no default next state/);
            next();
        });

        it('Fails when there is an unknon state', function (next) {
            let chimp = new Monito({
                init: (monito) => {
                    monito.state = 'register';
                },
                states: {
                    register: (monito, next) => {
                        next(null, 'somethingUnknown');
                    }
                }
            });
            chimp.start();
            // TODO: Test the error
            next();
        });
    });
});