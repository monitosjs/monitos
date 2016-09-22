'use strict';

const d20 = require('d20');
const expect = require('chai').expect;
const sinon = require('sinon');

const Monito = require('../lib/monito');

describe('Monitos', function () {

    var sandbox = sinon.sandbox.create();

    afterEach(function () {
        sandbox.restore();
    });

    describe('Happy flows', function () {

        it('Runs a state machine with no random transitions', function (next) {
            var rollSpy = sandbox.spy(d20, 'roll');
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
            chimp.on('end', function () {
                expect(rollSpy.callCount).to.equal(0);
                next();
            });
        });

        it('Runs a state machine with random transitions', function (next) {
            var rollSpy = sandbox.spy(d20, 'roll');
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
            chimp.on('end', function () {
                expect(rollSpy.callCount).to.be.at.least(2);
                next();
            });
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
            chimp.on('error', function (err) {
                expect(err).to.be.an('error');
                expect(err).to.have.property('message', 'Something went wrong');
                next();
            });
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
            chimp.on('error', function (err) {
                expect(err).to.be.an('error');
                expect(err).to.have.property('message', 'There is no default next state');
                next();
            });
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
            chimp.on('end', function () {
                next();
            });
        });
    });
});