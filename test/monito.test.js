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
            var states = [];
            let chimp = new Monito({
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
                    next();
                }
            }, 'register');
            chimp.start();
            chimp.on('state', function (state) {
                states.push(state);
            });
            chimp.on('end', function () {
                expect(rollSpy.callCount).to.equal(0);
                expect(states).to.have.length(4);
                expect(states[0]).to.equal('getProfile');
                expect(states[1]).to.equal('browse');
                expect(states[2]).to.equal('shop');
                expect(states[3]).to.equal('logout');
                next();
            });
        });

        it('Runs a state machine with random transitions', function (next) {
            var rollSpy = sandbox.spy(d20, 'roll');
            var states = [];
            let chimp = new Monito({
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
            }, 'register');
            chimp.start();
            chimp.on('state', function (state) {
                states.push(state);
            });
            chimp.on('end', function () {
                expect(rollSpy.callCount).to.be.at.least(1);
                expect(states).to.have.length.least(3);
                expect(states[0]).to.equal('getProfile');
                expect(states[states.length - 1]).to.equal('logout');
                next();
            });
        });
    });

    describe('Unhappy flows', function () {

        it('Handles errors', function (next) {
            let chimp = new Monito({
                register: (monito, next) => {
                    next(new Error('Something went wrong'));
                }
            }, 'register');
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
            expect(fn).to.throw(Error, /Missing argument "states"/);
            next();
        });

        it('Requires the argument "options.states"', function (next) {
            var fn = function () {
                new Monito({
                    foo: (monito, next) => {
                        next();
                    }
                });
            };
            expect(fn).to.throw(Error, /Missing argument "startState"/);
            next();
        });

        it('Requires a default next state when there are random transitions', function (next) {
            let chimp = new Monito({
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
            }, 'register');
            chimp.start();
            chimp.on('error', function (err) {
                expect(err).to.be.an('error');
                expect(err).to.have.property('message', 'There is no default next state');
                next();
            });
        });

        it('Fails when there is an unknon state', function (next) {
            let chimp = new Monito({
                register: (monito, next) => {
                    next(null, 'somethingUnknown');
                }
            }, 'register');
            chimp.start();
            chimp.on('error', function (err) {
                expect(err).to.be.an('error');
                expect(err).to.have.property('message', 'Unknown monito state: somethingUnknown');
                next();
            });
        });
    });

    describe('In-depth saving throw transition tests', function () {

        it('Saves the throw and goes into the specified state', function (next) {
            var states = [];
            var difficulty = 10;
            sandbox.stub(d20, 'roll', function (/* dice */) {
                return difficulty + 1; // Passes the saving throw
            });
            let chimp = new Monito({
                open: (monito, next) => {
                    next(null, {
                        broken: 10
                    }, 'close');
                },
                broken: (monito, next) => {
                    next(null, 'close');
                },
                close: (monito, next) => {
                    next();
                }
            }, 'open');
            chimp.start();
            chimp.on('state', function (state) {
                states.push(state);
            });
            chimp.on('end', function () {
                expect(states).to.have.length(2);
                expect(states[0]).to.equal('broken');
                expect(states[1]).to.equal('close');
                next();
            });
        });

        it('Fails the throw and goes into the default state', function (next) {
            var states = [];
            var difficulty = 10;
            sandbox.stub(d20, 'roll', function (/* dice */) {
                return difficulty - 1; // Fails the saving throw
            });
            let chimp = new Monito({
                open: (monito, next) => {
                    next(null, {
                        broken: difficulty
                    }, 'close');
                },
                broken: (monito, next) => {
                    next(null, 'close');
                },
                close: (monito, next) => {
                    next();
                }
            }, 'open');
            chimp.start();
            chimp.on('state', function (state) {
                states.push(state);
            });
            chimp.on('end', function () {
                expect(states).to.have.length(1);
                expect(states[0]).to.equal('close');
                next();
            });
        });
    });
});