![Monitos](assets/monitos.png?raw=true "Monitos")

# Monitos

Monitos (Spanish for _little monkeys_) are state machines. Their transitions can be either predetermined
or have certain randomness described by saving throws.

A saving throw is a roll of 20-sided dice to determine if a specific transition should be taken or not. 
 
Example:

```javascript
let chimp = new Monito({
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
}, 'register');                     // Initial state

chimp.start();
```

See the [full code of the example](example/shopper).

## Usage

```
new Monito(states, initialState);
```
 
### Arguments

* `states` (`Object`, mandatory) - The state descriptor. An object where the key is the name of the state and
the value is a function with signature `(Function callback)`, whose `this` is the monito instanc itself. 
The function `callback` has the following signature:
    * `callback([Object error[, Object savingThrows[, String defaultNextState]]])`
        * `error` (`Object`, optional) - Like in most of the callback signatures, an optional errorsis the first argument. `null` if everything went fine.
        * `savingThrows` (`Object`, optional) - An object where the key is the name of a potential state candidate and the value is the difficulty of the saving throw to go into that state
        * `defaultNextState` (`String`, optional) - Name of the default next state. If not present, the state machine will stop.
* `initialState` (`String`, mandatory) - Name of the initial state.
 
### Events

* `error(Object err)` - Whenever an error occurred. The first and only argument is the error object.
* `transition(Object data)` - Fired when there is a transition to a new state. The object `data ` contains the two following `String` properties:
    * `previousState` - Name of the previous state, `undefined` if this is the first transition of the state machine.
    * `nextState` - Name of state the machine is transitioning to.
* `end` - Fired when the state machine comes to an end.

### API

Given:

```
var chimp = new Monito(states, initialState);
```

The following functions are available:

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