'use strict';

const whilst = require('async/whilst');
const EventEmitter = require('events');
const util = require('util');

const lang = require('./lang');

class Monito extends EventEmitter {

    constructor(options) {
        super(options);

        this.alive = false;

        if (!options.persona) {
            throw new Error('Missing mandatory option "persona"');
        }
        this.persona = options.persona;

        this.emit('init');
    }

    start() {
        this.report({ type: 'state', message: 'Hello, I am a monito' });
        this.alive = true;
        this.persona.init(this);

        whilst(() => {
            return this.alive
        }, next => {
            this.tick((err, nextStateSavingThrows, defaultNextState) => {
                if (!nextStateSavingThrows) {
                    return next(err);
                }
                if (typeof nextStateSavingThrows === 'string') {
                    this.state = nextStateSavingThrows;
                    return next(err);
                }
                if (!defaultNextState) {
                    throw new Error('There is no default next state');
                }
                var nextStateCandidate;
                for (var i = 0, keys = Object.keys(nextStateSavingThrows); i < keys.length; i++) {
                    var difficulty = nextStateSavingThrows[keys[i]];
                    if (lang.savingThrow(difficulty)) {
                        nextStateCandidate = keys[i];
                    }
                }
                if (!nextStateCandidate) {
                    nextStateCandidate = defaultNextState;
                }
                this.state = nextStateCandidate;
                next(err);
            });
        }, err => {
            if (err) {
                this.report({
                    type: 'error',
                    err: err,
                    message: 'An error occurred'
                });
            }
        });
    }

    tick(next) {
        var state = this.persona.states[this.state];
        if (!state) {
            return next(new Error('Unknown monito state: ' + this.state));
        }
        this.report({
            type: 'state',
            message: 'Starting state ' + this.state
        });
        this.persona.states[this.state].call(this, this, next);
    }

    stop() {
        this.alive = false;
    }

    report(options) {
        this.emit('report', options);
    }
}

module.exports = Monito;