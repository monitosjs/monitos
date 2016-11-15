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

    tick(next) {
        if (!this.alive) {
            return next();
        }
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
                    nextStateCandidate = keys[i]; // TODO: Unit test to make sure we stop here
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
        this.state = this.startState;
        process.nextTick(() => {
            this.tick(err => {
                if (err) {
                    this.emit('error', err);
                }
                this.emit('end');
            });
        });
    }
}

module.exports = Monito;