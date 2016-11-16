'use strict';

const EventEmitter = require('events');

const CHALLENGES = require('./challenges');

class Monito extends EventEmitter {

    getTransitionChallenge() {
        return this._transitionChallenge;
    }

    setTransitionChallenge(challenge) {
        this._transitionChallenge = challenge;
    }

    constructor(options) {
        super();
        this.alive = false;
        if (!options.states) {
            throw new Error('Missing option "states"');
        }
        if (!options.initialState) {
            throw new Error('Missing option "initialState"');
        }
        this.states = options.states;
        this.initialState = options.initialState;
        this._transitionChallenge = CHALLENGES.d20;
    }

    tick(next) {
        var state = this.states[this.state];
        if (!state) {
            return next(new Error('Unknown monito state: ' + this.state));
        }
        this.emit('transition', {
            previousState: this.previousState,
            nextState: this.state
        });
        state.call(this, (err, nextStateSavingThrows, defaultNextState) => {
            if (err) {
                return next(err);
            }
            if (!nextStateSavingThrows) {
                this.alive = false;
            }
            if (!this.alive) {
                return next();
            }
            if (typeof nextStateSavingThrows === 'string') {
                this.previousState = this.state;
                this.state = nextStateSavingThrows;
                return this.tick(next);
            }
            if (!defaultNextState) {
                return next(new Error('There is no default next state'));
            }
            var nextStateCandidate;
            for (let i = 0, keys = Object.keys(nextStateSavingThrows); i < keys.length; i++) {
                var difficulty = nextStateSavingThrows[keys[i]];
                if (typeof difficulty === 'function') {
                    difficulty = difficulty.call(this, this);
                }
                if (this._transitionChallenge(difficulty)) {
                    nextStateCandidate = keys[i];
                    break;
                }
            }
            if (!nextStateCandidate) {
                nextStateCandidate = defaultNextState;
            }
            this.previousState = this.state;
            this.state = nextStateCandidate;
            this.tick(next);
        });
    }

    start() {
        this.alive = true;
        this.state = this.initialState;
        process.nextTick(() => {
            this.tick(err => {
                if (err) {
                    this.emit('error', {
                        err: err,
                        currentState: this.state
                    });
                }
                this.emit('end', {
                    finalState: this.state
                });
            });
        });
    }
}

module.exports = Monito;