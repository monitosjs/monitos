![Monitos](assets/monitos.png?raw=true "Monitos")

# Monitos

Monitos (Spanish for _little monkeys_) are state machines. Their transitions can be either predetermined
or have certain randomness described by Dungeons & Dragons saving throws.
 
Example:

```javascript
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
            monito.stop();
            next();
        }
    }
});

chimp.start();
```