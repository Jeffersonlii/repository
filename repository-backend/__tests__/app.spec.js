const request = require('supertest');
const cookieParser = require('cookie-parser');

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
// app.use(cookieParser());
require('../app').endpoints(app, {
    Images,
    Users,
    Sharelink,
});

let clearAllDB = async () => {
    await Images.remove({}, { multi: true }, function (err, numRemoved) {
        Images.loadDatabase(function (err) {
            // done
        });
    });
    await Users.remove({}, { multi: true }, function (err, numRemoved) {
        Users.loadDatabase(function (err) {
            // done
        });
    });
    await Sharelink.remove({}, { multi: true }, function (err, numRemoved) {
        Sharelink.loadDatabase(function (err) {
            // done
        });
    });
};
describe('Test POST /api/register/', () => {
    beforeEach(async (done) => {
        await clearAllDB();
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
    beforeEach(async (done) => {
        await clearAllDB();
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
describe('Test GET /api/logoff/', () => {
    let cookie;

    beforeEach(async (done) => {
        await clearAllDB();

        await request(app).post('/api/register/').send({
            username: 'bob',
            password: '12345678',
        });

        cookie = (
            await request(app).post('/api/login/').send({
                username: 'bob',
                password: '12345678',
            })
        ).headers['set-cookie'];
        done();
    });

    test('logout', async (done) => {
        expect(
            (await request(app).get('/api/getSessionId/').set('cookie', cookie))
                .body.userid !== undefined
        ).toBe(true);

        expect(
            (await request(app).get('/api/logoff/').set('cookie', cookie))
                .statusCode
        ).toBe(200);
        expect(
            (await request(app).get('/api/getSessionId/').set('cookie', cookie))
                .body.userid === undefined
        ).toBe(true);
        done();
    });
});
describe('Test GET /api/getSessionId/', () => {
    beforeEach((done) => {
        clearAllDB();
        done();
    });

    test('get existing id', async (done) => {
        await request(app).post('/api/register/').send({
            username: 'bob',
            password: '12345678',
        });

        expect(
            (
                await request(app)
                    .get('/api/getSessionId/')
                    .set(
                        'cookie',
                        //login request
                        //we need to attach the cookie manually
                        (
                            await request(app).post('/api/login/').send({
                                username: 'bob',
                                password: '12345678',
                            })
                        ).headers['set-cookie']
                    )
            ).body.userid !== undefined
        ).toBe(true);
        done();
    });
    test('get non existing id', async (done) => {
        expect(
            (await request(app).get('/api/getSessionId/')).body.userid ===
                undefined
        ).toBe(true);
        done();
    });
});
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
//         test('invalid link', (done) => {
//             request(app)
//                 .get('/')
//                 .then((response) => {
//                     expect(response.statusCode).toBe(200);
//                     done();
//                 });
//         });

//     test('valid link', (done) => {
//         console.log(123);
//         request(app)
//             .get('/')
//             .then((response) => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });
