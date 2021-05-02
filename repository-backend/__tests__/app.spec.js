const request = require('supertest');

let Datastore = require('nedb'),
    Images = new Datastore({
        filename: 'testdb/images.db',
        autoload: true,
        timestampData: true,
    }),
    Users = new Datastore({
        filename: 'testdb/users.db',
        autoload: true,
    }),
    Sharelink = new Datastore({
        filename: 'testdb/sharelinks.db',
        autoload: true,
    });
const app = require('express')();
require('../app').endpoints(app, {
    Images,
    Users,
    Sharelink,
});

describe('Test POST /api/register/', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test POST /api/login/', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test GET /api/logoff/', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test GET /api/getSessionId/', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test POST /api/image/', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test GET /api/image/', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test GET /api/image/:id', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test DELETE /api/image/:id', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test POST /api/share/:id', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
describe('Test GET /api/share/:id', () => {
    test('It should response the GET method', (done) => {
        console.log(123);
        request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
