/*jshint esversion: 6 */

const express = require('express');
const models = require('./models');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const { param, body, validationResult } = require('express-validator');

app.use(
    session({
        secret: 'temp secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            // secure: true, //prevents mixed content// breaks site when no ssl
            sameSite: true, //prevents CSRF
            HttpOnly: true,
        },
    })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//CORS
const cors = require('cors');
app.use(
    cors({
        origin: process.env.PROD ? 'http://localhost' : 'http://localhost:3000',
        methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
        credentials: true,
    })
);
//db
let Datastore = require('nedb'),
    Images = new Datastore({
        filename: 'db/images.db',
        autoload: true,
        timestampData: true,
    }),
    Users = new Datastore({
        filename: 'db/users.db',
        autoload: true,
    }),
    Sharelink = new Datastore({
        filename: 'db/sharelinks.db',
        autoload: true,
    });

app.use(function (req, res, next) {
    //attach auth session
    req.userid = req.session.userid ? req.session.userid : null;
    console.log('HTTP request', req.userid, req.method, req.url, req.body);
    next();
});
let isAuthenticated = (req, res, next) => {
    //middleware to check if authenticated/logged in
    if (!req.userid) return res.status(401).end('access denied');
    next();
};

let validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
/////////////////////////////////// USERS ///////////////////////////////////////

app.post(
    '/api/register/',
    body('username')
        .isAlphanumeric()
        .not()
        .isEmpty()
        .trim()
        .escape()
        .withMessage('Username be alphanumeric and nonempty'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    validate,
    function (req, res, next) {
        Users.findOne({ username: req.body.username }, (e, p) => {
            if (p !== null) {
                res.status(409).end(
                    'User name: ' + req.body.username + ' is taken'
                );
            } else {
                Users.insert(
                    new models.User(
                        {
                            username: req.body.username,
                            password: req.body.password,
                        },
                        true
                    ),
                    (e, p) => {
                        if (e) {
                            return res.status(409).end('Something went wrong');
                        } else {
                            req.session.userid = p._id;
                            return res.status(201).send(p);
                        }
                    }
                );
            }
        });
    }
);
app.post('/api/login/', function (req, res, next) {
    Users.findOne({ username: req.body.username }, (e, p) => {
        if (p === null) {
            res.status(401).end('access denied');
        } else {
            let userobj = new models.User({
                username: p.username,
                password: p.password,
            });
            if (userobj.verifyPassword(req.body.password, p.salt)) {
                req.session.userid = p._id;
                return res.status(200).send(p);
            } else {
                return res.status(401).end('access denied');
            }
        }
    });
});

app.get('/api/logoff/', function (req, res, next) {
    req.session.userid = undefined;
    return res.status(200).send({ success: true });
});

app.get('/api/getSessionId/', function (req, res, next) {
    return res.status(200).send({ userid: req.session.userid });
});

/////////////////////////////////// IMAGES //////////////////////////////////////

//add multiple images
app.post(
    '/api/image/',
    isAuthenticated,
    upload.array('file'),
    function (req, res, next) {
        Users.findOne({ _id: req.userid }, (e, p) => {
            req.files.forEach((file) => {
                Images.insert(
                    new models.Image({
                        path: file.path,
                        mimetype: file.mimetype,
                        uploaderid: req.userid,
                    }),
                    (e, p) => {
                        if (e) {
                            return res.status(409).end('Something went wrong');
                        }
                    }
                );
            });
            return res.status(201).send(p);
        });
    }
);
//get all images ids for the logged in user
app.get('/api/image/', isAuthenticated, function (req, res, next) {
    let owner = req.userid;
    Images.find({ uploaderid: owner })
        .sort({ createdAt: 1 })
        .projection({ path: -1, mimetype: -1, updatedAt: -1 })
        .exec(function (err, data) {
            if (err) {
                res.status(400).json('Something went Wrong.');
            } else {
                res.json({
                    images: data.reverse(),
                });
            }
        });
});
//get 1 image by image id
app.get(
    '/api/image/:id',
    isAuthenticated,
    param('id').isAlphanumeric().withMessage('Id must be alphanumeric'),
    validate,
    function (req, res, next) {
        Images.findOne({ _id: req.params.id }, (e, p) => {
            if (p === null) {
                res.status(404).end(
                    'image: ' + req.params.id + ' does not exists'
                );
            } else if (p.uploaderid !== req.userid) {
                res.status(401).end(
                    'image: ' + req.params.id + ' does not belong to requester'
                );
            } else {
                res.setHeader('Content-Type', p.mimetype);
                res.sendFile(p.path, { root: __dirname });
            }
        });
    }
);
//delete 1 image by image id
app.delete(
    '/api/image/:id',
    isAuthenticated,
    param('id').isAlphanumeric().withMessage('Id must be alphanumeric'),
    validate,
    function (req, res, next) {
        Images.findOne({ _id: req.params.id }, (e, p) => {
            if (p === null) {
                return res
                    .status(404)
                    .end('image: ' + req.params.id + ' does not exists');
            } else if (p.uploaderid !== req.userid) {
                return res.status(401).end('access denied');
            } else {
                Images.remove({ _id: req.params.id }, {}, (e) => {
                    if (!e) {
                        fs.unlink(`${__dirname}/${p.path}`, (err) => {
                            if (err) {
                                res.status(400).json(
                                    'failed to delete local image:' + err
                                );
                            } else {
                                res.status(200).json(p);
                            }
                        });
                    } else {
                        res.status(400).json(
                            'failed to delete local image:' + err
                        );
                    }
                });
            }
        });
    }
);

/////////////////////////////////// SHARELINKS //////////////////////////////////////
//create link
app.post(
    '/api/share/:id',
    isAuthenticated,
    param('id').isAlphanumeric().withMessage('Id must be alphanumeric'),
    validate,
    function (req, res, next) {
        Images.findOne({ _id: req.params.id }, (e, p) => {
            if (!p) {
                return res
                    .status(404)
                    .end('image: ' + req.params.id + ' does not exists');
            }
            if (p.uploaderid !== req.userid) {
                return res.status(401).end('access denied');
            }
            let temporal = req.body.limits.temporal;
            let visits = req.body.limits.visits;

            Sharelink.insert(
                new models.ShareLink({
                    imageid: p._id,
                    creatorid: req.userid,
                    limits: { temporal, visits },
                }),
                (e, p) => {
                    if (e) {
                        return res.status(409).end('Something went wrong');
                    } else {
                        return res.status(201).send(p);
                    }
                }
            );
        });
    }
);
app.get(
    '/api/share/:id',
    param('id').isAlphanumeric().withMessage('Id must be alphanumeric'),
    validate,
    function (req, res, next) {
        Sharelink.findOne({ _id: req.params.id }, (e, p) => {
            console.log(p);

            if (e) {
                return res.status(409).end('Something went wrong');
            }
            let maxVisits = p.limits.visits;
            if (maxVisits) {
                if (p.visits > maxVisits) {
                    return res.status(401).end('Link is invalid/expired');
                }
            }
            let temporalLimit = p.limits.temporal;
            if (temporalLimit) {
                console.log(new Date() > new Date(temporalLimit));
                if (new Date() > new Date(temporalLimit)) {
                    return res.status(401).end('Link is invalid/expired');
                }
            }

            //increment visits state
            Sharelink.update({ _id: req.params.id }, { $inc: { visits: 1 } });

            Images.findOne({ _id: p.imageid }, (e, image) => {
                if (image === null) {
                    res.status(404).end(
                        'image: ' + req.params.id + ' does not exists'
                    );
                } else {
                    res.setHeader('Content-Type', image.mimetype);
                    res.sendFile(image.path, { root: __dirname });
                }
            });
        });
    }
);
const http = require('http');
const PORT = 3001;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log('HTTP server on http://localhost:%s', PORT);
});
