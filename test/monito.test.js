'use strict';

const d20 = require('d20');
const expect = require('chai').expect;
const sinon = require('sinon');

const Monito = require('../lib/monito');

describe('Monitos', () => {

    var sandbox = sinon.sandbox.create();

    afterEach(() => {
        sandbox.restore();
    });

    describe('Happy flows', () => {

        it('Runs a state machine with no random transitions', next => {
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
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(rollSpy.callCount).to.equal(0);
                expect(states).to.have.length(5);
                expect(states[0]).to.equal('register');
                expect(states[1]).to.equal('getProfile');
                expect(states[2]).to.equal('browse');
                expect(states[3]).to.equal('shop');
                expect(states[4]).to.equal('logout');
                next();
            });
        });

        it('Does not matter the order in which we call on() and start()', next => {
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
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(rollSpy.callCount).to.equal(0);
                expect(states).to.have.length(5);
                expect(states[0]).to.equal('register');
                expect(states[1]).to.equal('getProfile');
                expect(states[2]).to.equal('browse');
                expect(states[3]).to.equal('shop');
                expect(states[4]).to.equal('logout');
                next();
            });
            chimp.start();
        });

        it('Runs a state machine with random transitions', next => {
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
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(rollSpy.callCount).to.be.at.least(1);
                expect(states).to.have.length.least(4);
                expect(states[0]).to.equal('register');
                expect(states[states.length - 1]).to.equal('logout');
                next();
            });
        });

        it('Accepts functions as valid challenges, and the challenge is passed', next => {
            var states = [];
            let chimp = new Monito({
                open: (monito, next) => {
                    next(null, {
                        broken: (monito) => {
                            expect(monito).to.be.an('object');
                            return 0;
                        }
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
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(states).to.have.length(3);
                expect(states[0]).to.equal('open');
                expect(states[1]).to.equal('broken');
                expect(states[2]).to.equal('close');
                next();
            });
        });

        it('Accepts functions as valid challenges, and the challenge is failed', next => {
            var states = [];
            let chimp = new Monito({
                open: (monito, next) => {
                    next(null, {
                        broken: monito => {
                            expect(monito).to.be.an('object');
                            return 21;
                        }
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
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(states).to.have.length(2);
                expect(states[0]).to.equal('open');
                expect(states[1]).to.equal('close');
                next();
            });
        });

        it('Allows setting and getting a custom challenge, and this challenge is passed', next => {
            var states = [];
            let chimp = new Monito({
                open: (monito, next) => {
                    next(null, {
                        broken: (/* monito */) => {
                            return 'pass';
                        }
                    }, 'close');
                },
                broken: (monito, next) => {
                    next(null, 'close');
                },
                close: (monito, next) => {
                    next();
                }
            }, 'open');
            chimp.setTransitionChallenge(difficulty => {
                return difficulty === 'pass';
            });
            expect(chimp.getTransitionChallenge()).to.be.a('function');
            chimp.start();
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(states).to.have.length(3);
                expect(states[0]).to.equal('open');
                expect(states[1]).to.equal('broken');
                expect(states[2]).to.equal('close');
                next();
            });
        });

        it('Allows setting and getting a custom challenge, and this challenge is passed', next => {
            var states = [];
            let chimp = new Monito({
                open: (monito, next) => {
                    next(null, {
                        broken: (/* monito */) => {
                            return 'not passed';
                        }
                    }, 'close');
                },
                broken: (monito, next) => {
                    next(null, 'close');
                },
                close: (monito, next) => {
                    next();
                }
            }, 'open');
            chimp.setTransitionChallenge(difficulty => {
                return difficulty === 'pass';
            });
            expect(chimp.getTransitionChallenge()).to.be.a('function');
            chimp.start();
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(states).to.have.length(2);
                expect(states[0]).to.equal('open');
                expect(states[1]).to.equal('close');
                next();
            });
        });
    });

    describe('Unhappy flows', () => {

        it('Handles errors', next => {
            let chimp = new Monito({
                register: (monito, next) => {
                    next(new Error('Something went wrong'));
                }
            }, 'register');
            chimp.start();
            chimp.on('error', err => {
                expect(err).to.be.an('error');
                expect(err).to.have.property('message', 'Something went wrong');
                next();
            });
        });

        it('Requires the argument "options"', next => {
            var fn = () => {
                new Monito();
            };
            expect(fn).to.throw(Error, /Missing argument "states"/);
            next();
        });

        it('Requires the argument "options.states"', next => {
            var fn = () => {
                new Monito({
                    foo: (monito, next) => {
                        next();
                    }
                });
            };
            expect(fn).to.throw(Error, /Missing argument "startState"/);
            next();
        });

        it('Requires a default next state when there are random transitions', next => {
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
            chimp.on('error', err => {
                expect(err).to.be.an('error');
                expect(err).to.have.property('message', 'There is no default next state');
                next();
            });
        });

        it('Fails when there is an unknon state', next => {
            let chimp = new Monito({
                register: (monito, next) => {
                    next(null, 'somethingUnknown');
                }
            }, 'register');
            chimp.start();
            chimp.on('error', err => {
                expect(err).to.be.an('error');
                expect(err).to.have.property('message', 'Unknown monito state: somethingUnknown');
                next();
            });
        });
    });

    describe('In-depth saving throw transition tests', () => {

        it('Saves the throw and goes into the specified state', next => {
            var states = [];
            var difficulty = 10;
            sandbox.stub(d20, 'roll', (/* dice */) => {
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
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(states).to.have.length(3);
                expect(states[0]).to.equal('open');
                expect(states[1]).to.equal('broken');
                expect(states[2]).to.equal('close');
                next();
            });
        });

        it('Fails the throw and goes into the default state', next => {
            var states = [];
            var difficulty = 10;
            sandbox.stub(d20, 'roll', (/* dice */) => {
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
            chimp.on('state', state => {
                states.push(state);
            });
            chimp.on('end', () => {
                expect(states).to.have.length(2);
                expect(states[0]).to.equal('open');
                expect(states[1]).to.equal('close');
                next();
            });
        });
    });
});