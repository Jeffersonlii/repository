/*jshint esversion: 6 */

exports.endpoints = (app, db) => {
    const models = require('./models');
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
            .withMessage('Username must be alphanumeric')
            .not()
            .isEmpty()
            .withMessage('Username be non nonempty')
            .trim()
            .escape(),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        validate,
        function (req, res, next) {
            db.Users.findOne({ username: req.body.username }, (e, p) => {
                if (p !== null) {
                    res.status(409).json({
                        errors: [
                            {
                                msg: `User name: ${req.body.username}  is taken`,
                            },
                        ],
                    });
                } else {
                    db.Users.insert(
                        new models.User(
                            {
                                username: req.body.username,
                                password: req.body.password,
                            },
                            true
                        ),
                        (e, p) => {
                            if (e) {
                                return res
                                    .status(409)
                                    .end('Something went wrong');
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
        db.Users.findOne({ username: req.body.username }, (e, p) => {
            let errorObj = {
                errors: [
                    {
                        msg: 'Invalid Credentials',
                    },
                ],
            };

            if (p === null) {
                res.status(401).json(errorObj);
            } else {
                let userobj = new models.User({
                    username: p.username,
                    password: p.password,
                });
                if (userobj.verifyPassword(req.body.password, p.salt)) {
                    req.session.userid = p._id;
                    return res.status(200).send(p);
                } else {
                    return res.status(401).json(errorObj);
                }
            }
        });
    });

    app.get('/api/logoff/', function (req, res, next) {
        req.session.userid = undefined;
        return res.status(200).json({ success: true });
    });

    app.get('/api/getSessionId/', function (req, res, next) {
        return res.status(200).json({ userid: req.session.userid });
    });

    /////////////////////////////////// IMAGES //////////////////////////////////////

    //add multiple images
    app.post(
        '/api/image/',
        isAuthenticated,
        upload.array('file'),
        function (req, res, next) {
            req.files.forEach((file) => {
                if (!file.mimetype.includes('image')) {
                    return res.status(400).json({
                        errors: [
                            {
                                msg: `Only Images are allowed`,
                            },
                        ],
                    });
                }
            });
            db.Users.findOne({ _id: req.userid }, (e, p) => {
                if (!p) {
                    return res.status(404).json({
                        errors: [
                            {
                                msg: `User doesn't exist`,
                            },
                        ],
                    });
                }

                req.files.forEach((file) => {
                    db.Images.insert(
                        new models.Image({
                            path: file.path,
                            mimetype: file.mimetype,
                            uploaderid: req.userid,
                        }),
                        (e, p) => {
                            if (e) {
                                return res
                                    .status(409)
                                    .end('Something went wrong');
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
        let errorObj = {
            errors: [
                {
                    msg: 'Failed to fetch images',
                },
            ],
        };

        let owner = req.userid;
        db.Images.find({ uploaderid: owner })
            .sort({ createdAt: 1 })
            .projection({ path: -1, mimetype: -1, updatedAt: -1 })
            .exec(function (err, data) {
                if (err) {
                    return res.status(400).json(errorObj);
                } else {
                    return res.json({
                        images: data.reverse(),
                        msgs: ['Images Fetched'],
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
            db.Images.findOne({ _id: req.params.id }, (e, p) => {
                if (p === null) {
                    res.status(404).end(
                        'image: ' + req.params.id + ' does not exists'
                    );
                } else if (p.uploaderid !== req.userid) {
                    res.status(401).end(
                        'image: ' +
                            req.params.id +
                            ' does not belong to requester'
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
            db.Images.findOne({ _id: req.params.id }, (e, p) => {
                if (p === null) {
                    return res
                        .status(404)
                        .end('image: ' + req.params.id + ' does not exists');
                } else if (p.uploaderid !== req.userid) {
                    return res.status(401).end('access denied');
                } else {
                    db.Images.remove({ _id: req.params.id }, {}, (e) => {
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
            db.Images.findOne({ _id: req.params.id }, (e, p) => {
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

                db.Sharelink.insert(
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
            db.Sharelink.findOne({ _id: req.params.id }, (e, p) => {
                if (e || !p) {
                    return res.status(409).end('Something went wrong');
                }
                let maxVisits = p.limits.visits;
                if (maxVisits) {
                    if (p.visits >= maxVisits) {
                        db.Sharelink.remove({ _id: p._id });

                        return res.status(401).end('Link is invalid/expired');
                    }
                }
                let temporalLimit = p.limits.temporal;
                if (temporalLimit) {
                    if (new Date() > new Date(temporalLimit)) {
                        db.Sharelink.remove({ _id: p._id });

                        return res.status(401).end('Link is invalid/expired');
                    }
                }

                //increment visits state
                db.Sharelink.update(
                    { _id: req.params.id },
                    { $inc: { visits: 1 } }
                );

                db.Images.findOne({ _id: p.imageid }, (e, image) => {
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
};
