'use strict';

const EventEmitter = require('events');
const whilst = require('async/whilst');

const CHALLENGES = require('./challenges');

class Monito extends EventEmitter {

    getTransitionChallenge() {
        return this._transitionChallenge;
    }

    setTransitionChallenge(challenge) {
        this._transitionChallenge = challenge;
    }

    constructor(states, startState) {
        super();
        this.alive = false;
        if (!states) {
            throw new Error('Missing argument "states"');
        }
        if (!startState) {
            throw new Error('Missing argument "startState"');
        }
        this.states = states;
        this.startState = startState;
        this._transitionChallenge = CHALLENGES.d20;
    }

    start() {
        this.alive = true;
        this.state = this.startState;
        whilst(() => {
            return this.alive;
        }, next => {
            process.nextTick(() => {
                this.tick((err, nextStateSavingThrows, defaultNextState) => {
                    if (!nextStateSavingThrows) {
                        this.alive = false;
                        this.emit('end');
                        return next(err);
                    }
                    if (typeof nextStateSavingThrows === 'string') {
                        this.state = nextStateSavingThrows;
                        return next(err);
                    }
                    if (!defaultNextState) {
                        return next(new Error('There is no default next state'));
                    }
                    var nextStateCandidate;
                    for (var i = 0, keys = Object.keys(nextStateSavingThrows); i < keys.length; i++) {
                        var difficulty = nextStateSavingThrows[keys[i]];
                        if (typeof difficulty === 'function') {
                            difficulty = difficulty.call(this, this);
                        }
                        if (this._transitionChallenge(difficulty)) {
                            nextStateCandidate = keys[i];
                        }
                    }
                    if (!nextStateCandidate) {
                        nextStateCandidate = defaultNextState;
                    }
                    this.state = nextStateCandidate;
                    next(err);
                });
            });
        }, err => {
            if (err) {
                this.alive = false;
                this.emit('error', err);
            }
        });
    }

    tick(next) {
        var state = this.states[this.state];
        if (!state) {
            return next(new Error('Unknown monito state: ' + this.state));
        }
        this.emit('state', this.state);
        state.call(this, this, next);
    }
}

module.exports = Monito;