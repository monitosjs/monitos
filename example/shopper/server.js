'use strict';

const restify = require('restify');

let server = restify.createServer({
    name: 'ECommerceAPI'
});

server.listen(8080);

let basket = [];

function delayMiddleware() {
    return function (req, res, next) {
        setTimeout(next, 100);
    };
}

server.post('/register', delayMiddleware(), function (req, res, next) {
    setTimeout(() => {
        res.send({ success: true });
        next();
    }, 100);
});

server.get('/profile', delayMiddleware(), function (req, res, next) {
    setTimeout(() => {
        res.send({
            name: 'Foo bar',
            bio: 'Lorem ipsum dolor sit amet'
        });
        next();
    }, 100);
});

server.get('/basket', delayMiddleware(), function (req, res, next) {
    setTimeout(() => {
        res.send(basket);
        next();
    }, 100);
});

server.put('/basket', delayMiddleware(), function (req, res, next) {
    basket.push({ foo: 'bar' });
    res.send(basket);
    return next();
});

server.get('/browse', delayMiddleware(), function (req, res, next) {
    res.send({
        foo: 'bar'
    });
    return next();
});

server.get('/search', delayMiddleware(), function (req, res, next) {
    res.send({
        foo: 'bar'
    });
    return next();
});

module.exports = server;