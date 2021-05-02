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

let clearAllDB = () => {
    Images.remove({}, { multi: true }, function (err, numRemoved) {
        Images.loadDatabase(function (err) {
            // done
        });
    });
    Users.remove({}, { multi: true }, function (err, numRemoved) {
        Users.loadDatabase(function (err) {
            // done
        });
    });
    Sharelink.remove({}, { multi: true }, function (err, numRemoved) {
        Sharelink.loadDatabase(function (err) {
            // done
        });
    });
};
describe('Test POST /api/register/', () => {
    beforeEach((done) => {
        clearAllDB();
        done();
    });

    test('invalid password and username', (done) => {
        request(app)
            .post('/api/register/')
            .send({ username: '', password: '12345' })
            .then((response) => {
                expect(response.statusCode).toBe(400);
                done();
            });
    });
    test('passing request', (done) => {
        request(app)
            .post('/api/register/')
            .send({ username: 'john', password: '12345678' })

            .then((response) => {
                expect(response.statusCode).toBe(201);
                done();
            });
    });
    test('username taken', (done) => {
        request(app)
            .post('/api/register/')
            .send({
                username: 'bob',
                password: '12345678',
            })
            .then(() => {
                request(app)
                    .post('/api/register/')
                    .send({
                        username: 'bob',
                        password: '12345678',
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(409);
                        done();
                    });
            });
    });
});
describe('Test POST /api/login/', () => {
    beforeEach((done) => {
        clearAllDB();
        done();
    });

    test('bad creds', (done) => {
        request(app)
            .post('/api/register/')
            .send({
                username: 'bob',
                password: '12345678',
            })
            .then(() => {
                request(app)
                    .post('/api/login/')
                    .send({
                        username: 'bob',
                        password: '1234567',
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(401);
                        done();
                    });
            });
    });
    test('good creds', (done) => {
        request(app)
            .post('/api/register/')
            .send({
                username: 'bob',
                password: '12345678',
            })
            .then(() => {
                request(app)
                    .post('/api/login/')
                    .send({
                        username: 'bob',
                        password: '12345678',
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        done();
                    });
            });
    });
});
// describe('Test GET /api/logoff/', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
// describe('Test GET /api/getSessionId/', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
// describe('Test POST /api/image/', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
// describe('Test GET /api/image/', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
// describe('Test GET /api/image/:id', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
// describe('Test DELETE /api/image/:id', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
// describe('Test POST /api/share/:id', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
// describe('Test GET /api/share/:id', () => {
//     test('It should response the GET method', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
