/*jshint esversion: 6 */

class Image {
    constructor({ path, mimetype, title, author, uploaderid }) {
        this.path = path;
        this.mimetype = mimetype;
        this.title = title;
        this.author = author;
        this.uploaderid = uploaderid;
    }
}

const crypto = require('crypto');
class User {
    constructor({ username, password }, hashpw = false) {
        this.username = username;

        let pw = hashpw
            ? this._saltHashPassword(password)
            : { hash: password, salt: undefined };

        this.password = pw.hash;
        this.salt = pw.salt;
    }
    _saltHashPassword(password, salt = undefined) {
        var s = salt ? salt : crypto.randomBytes(16).toString('base64');
        var hash = crypto.createHmac('sha512', s);
        hash.update(password);
        return { hash: hash.digest('base64'), salt: s };
    }
    verifyPassword(password, salt) {
        return this.password === this._saltHashPassword(password, salt).hash;
    }
}

exports.Image = Image;
exports.User = User;
