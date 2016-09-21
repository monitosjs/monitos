![Monitos](assets/monitos.png?raw=true "Monitos")

# Monitos

Monitos (Spanish for _little monkeys_) are state machines. Their transitions can be either predetermined
or have certain randomness described by saving throws.

A saving throw is a roll of 20-sided dice to determine if a specific transition should be taken or not. 
 
Example:

```javascript
let chimp = new Monito({
    
    // Initialize the instance
    init: (monito) => {
        monito.state = 'register';
    },
    
    // State definition
    states: {
        register: (monito, next) => {
            next(null, 'getProfile');    // Go straight to the state "getProfile"
        },
        getProfile: (monito, next) => {
            next(null, {
                browse: 4                // If your dice rolls 4 or more, go to "browse"
            }, 'shop');                  // Otherwise, by default, go to "shop"
        },
        browse: (monito, next) => {
            next(null, {
                browse: 6                // If your dice rolls 6 or more, go to "browse"
            }, 'shop');                  // Otherwise, by default, go to "shop"
        },
        shop: (monito, next) => {
            next(null, 'logout');       // Go straight to the state "logout"
        },
        logout: (monito, next) => {
            next();                     // This will be the last state
        }
    }
});

chimp.start();
```