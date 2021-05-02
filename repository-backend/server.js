const express = require('express');
const app = express();
const cors = require('cors');
app.use(
    cors({
        origin: process.env.PROD ? 'http://localhost' : 'http://localhost:3000',
        methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
        credentials: true,
    })
);

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

require('./app').endpoints(app, { Images, Users, Sharelink });

const http = require('http');
const PORT = 3001;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log('HTTP server on http://localhost:%s', PORT);
});
