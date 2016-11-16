![Monitos](assets/monitos.png?raw=true "Monitos")

# Monitos

Monitos (Spanish for _little monkeys_) are state machines. Their transitions can be either predetermined
or have certain randomness described by saving throws.

A saving throw is a roll of 20-sided dice to determine if a specific transition should be taken or not. 
 
Example:

```javascript
let chimp = new Monito({ 
    initialState: 'register', 
    states: {
        register: (next) => {
            next(null, 'getProfile');   // Go straight to the state "getProfile"
        },
        getProfile: (next) => {
            next(null, {
                browse: 4               // If your dice rolls 4 or more, go to "browse"
            }, 'shop');                 // Otherwise, by default, go to "shop"
        },
        browse: (next) => {
            next(null, {
                browse: monito => 6     // You can also use functions
            }, 'shop');                 
        },
        shop: (next) => {
            next(null, 'logout');       // Go straight to the state "logout"
        },
        logout: (next) => {
            next();                     // This will be the last state
        }
    }
});                     

chimp.start();

chimp.on('transition', data => {
    console.log(data.previousState + ' -> ' +data.nextState);
});

chimp.on('end', data => {
    console.log('Stopped in state ' + data.finalState);
});

chimp.on('error', data => {
    console.log('An error occurred in state ' + data.currentState);
    console.log(data.err);
});
```

See the [full code of the example](example/shopper.js).

## Usage

Given:

```
let monito = new Monito(options);
monito.start();
monito.on('transition', data => { });
monito.on('end', data => { });
```
 
### Options

The options object expects the following properties:

* `initialState` (`String`, mandatory) - Name of the initial state.
* `states` (`Object`, mandatory) - The state descriptor. An object where every key is the name of a state and
its value is a function with signature `(Function callback)`, whose scope is the monito instance itself. 
The function `callback` has the following signature:
    * `callback([Object error[, Object savingThrows[, String defaultNextState]]])`
        * `error` (`Object`, optional) - Like in most of the callback signatures, an optional errorsis the first argument. `null` if everything went fine.
        * `savingThrows` (`Object`, optional) - An object where the key is the name of a possible next state candidate and its value is the difficulty of the saving throw to go into that state.
        * `defaultNextState` (`String`, optional) - Name of the default next state, in case `savingThrows` is present and none of those savings are passed.

There are three possible ways to make this callback:
    * `callback(Object error, Object savingThrows, String defaultNextState)` - Performs the saving throws described in `savingThrows`; if all of them fail, the next state will be `defaultNextState`.
    * `callback(Object error, String nextState)` - Goes right away to `nextState`.
    * `callback(Object error)` and `callback()` - Ends the state machine.
 
### Events

* `error(Object data)` - Whenever an error occurred. The object `data` contains the following properties:
    * `err` (`Error`) 
    * `currentState` (`String`) - The state in which the error took place. 
* `transition(Object data)` - Fired when there is a transition to a new state. The object `data ` contains the following:
    * `previousState` (`String`) - Name of the previous state, `undefined` if this is the first transition of the state machine.
    * `nextState` (`String`) - Name of state the machine is transitioning to.
* `end(Object data)` - Fired when the state machine comes to an end. The object `data` contains the following property:
    * `finalState` (`String`) - Name of the state in which the monito stopped.

### API

* `monito.getTransitionChallenge() -> Function` - Gets the function currently used as a transition challenge.
* `monito.setTransitionChallenge(Function challenge)` - Sets a custom challenge to be used in transitions. If the function returns _truthy_, the challenged will be passed. Otherwise, it won't.
* `monito.start()` - Starts the state machine.

## Testing

Run all the tests (linting and unit tests) with the following npm task:

```
> npm test
```

You can run the linting and the unit tests individually:

```
> gulp test
> gulp lint
```

## License

[MIT](LICENSE)