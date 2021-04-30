/*jshint esversion: 6 */

const express = require('express');
const models = require('./models');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
app.use(
    session({
        secret: 'temp secret',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//db
let Datastore = require('nedb'),
    images = new Datastore({
        filename: 'db/images.db',
        autoload: true,
        timestampData: true,
    }),
    Users = new Datastore({
        filename: 'db/users.db',
        autoload: true,
    });

app.use(function (req, res, next) {
    req.userid = req.session.userid ? req.session.userid : null;
    console.log('HTTP request', req.userid, req.method, req.url, req.body);
    next();
});
let isAuthenticated = (req, res, next) => {
    if (!req.userid) return res.status(401).end('access denied');
    next();
};
/////////////////////////////////// USERS ///////////////////////////////////////

app.post('/api/register/', function (req, res, next) {
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
});
app.post('/api/login/', function (req, res, next) {
    Users.findOne({ username: req.body.username }, (e, p) => {
        if (p === null) {
            res.status(409).end(
                'User : ' + req.query.username + ' doesnt exist'
            );
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
    res.redirect('/');
});

app.get('/api/getSessionId/', function (req, res, next) {
    return res.status(200).send({ userid: req.session.userid });
});

/////////////////////////////////// IMAGES //////////////////////////////////////

//add one image
app.post(
    '/api/image/',
    isAuthenticated,
    upload.single('file'),
    function (req, res, next) {
        Users.findOne({ _id: req.userid }, (e, p) => {
            images.insert(
                new models.Image({
                    path: req.file.path,
                    mimetype: req.file.mimetype,
                    title: req.body.title,
                    author: p.username,
                    uploaderid: req.userid,
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
//get all images ids for a given user, if no user is given, use requester
app.get('/api/image/', isAuthenticated, function (req, res, next) {
    let owner = req.query.userid ? req.query.userid : req.userid;
    images
        .find({ uploaderid: owner })
        .sort({ createdAt: 1 })
        .projection({ path: -1, mimetype: -1, updatedAt: -1 })
        .exec(function (err, data) {
            if (err) {
                res.status(400).json('Something went Wrong.');
            } else {
                res.json({
                    images: data,
                    owner,
                    self: owner === req.userid,
                });
            }
        });
});
//get 1 image by image id
app.get('/api/image/:id', isAuthenticated, function (req, res, next) {
    images.findOne({ _id: req.params.id }, (e, p) => {
        if (p === null) {
            res.status(404).end('image: ' + req.params.id + ' does not exists');
        } else {
            res.setHeader('Content-Type', p.mimetype);
            res.sendFile(p.path, { root: __dirname });
        }
    });
});
//delete 1 image by image id
app.delete('/api/image/:id', isAuthenticated, function (req, res, next) {
    images.findOne({ _id: req.params.id }, (e, p) => {
        if (p === null) {
            return res
                .status(404)
                .end('image: ' + req.params.id + ' does not exists');
        } else if (p.uploaderid !== req.userid) {
            return res.status(401).end('access denied');
        } else {
            images.remove({ _id: req.params.id }, {}, (e) => {
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
                    res.status(400).json('failed to delete local image:' + err);
                }
            });
        }
    });
});
const https = require('https');
const PORT = 3000;

https.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log('HTTP server on https://localhost:%s', PORT);
});
