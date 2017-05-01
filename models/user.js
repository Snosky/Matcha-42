"use strict";
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Promise = require('bluebird');

const UserMeta = require('./userMeta');

class User
{
    constructor () { this.data = { metas: {} }; return this; }

    /* Getters */
    get id() { return this.data.id; }
    get email() { return this.data.email; }
    get password() { return this.data.password; }
    get token () { return this.data.token; }
    get metas () { return this.data.metas; }

    /* Setters */
    set id(id) { this.data.id = id; }
    set email(email) { this.data.email = email; }
    set password(password) { this.data.password = password; }
    set token(token) { this.data.token = token; }
    set metas(metas) { this.data.metas = metas; }

    /* Method */
     hydrate(data)
    {
        if (!data)
            return false;
        this.id = data.usr_id;
        this.email = data.usr_email;
        this.password = data.usr_password;
        this.token = data.usr_token;
        return this;
    }

    save(callback) {
        if (this.id) // Update
            update(this, callback);
        else
            create(this, callback);
    }

    verifyPassword(password, done) {
        bcrypt.compare(password, this.password, (err, result) => {
            done(result);
        });
    }

    hashPassword(done) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(this.password, salt, (err, hash) => {
                this.password = hash;
                done();
            });
        });
    }

    generateToken(done) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(this.email, salt, (err, token) => {
                this.token = token;
                this.save((err, user) => {
                    if (err)
                        return done(err);
                    done(null, user);
                });
            });
        });
    }

    getMetas(done) {
        UserMeta.getUserMetas(this.id, (err, result) => {
            if (err)
                return done(err);
            this.metas = result;
            done(null, this);
        });
    }

    /* == STATIC FUNCTIONS == */

    static findById(user_id, callback) {
        db.query('SELECT * FROM t_user WHERE usr_id=?', user_id, (err, result) => {
            if (err)
                return callback(err);

            callback(null, new User().hydrate(result[0]));
        });
    }

    static findByEmail(email, callback) {
        db.query('SELECT * FROM t_user WHERE usr_email=?', email, (err, result) => {
            if (err)
                return callback(err);
            if (result[0] === undefined)
                return callback(null, null);
            return callback(null, new User().hydrate(result[0]));
        })
    }

    static findByToken(token, callback) {
        db.query('SELECT * FROM t_user WHERE usr_token=?', token, (err, result) => {
            if (err)
                return callback(err);
            if (result[0] === undefined)
                return callback(null, null);
            return callback(null, new User().hydrate(result[0]));
        });
    }

    static uniqueEmail(email, callback) {
        db.query('SELECT * FROM t_user WHERE usr_email=?', email, (err, result) =>{
            if (err)
                return callback(err);
            callback(null, result.length);
        })
    }

    /* JSON */
    toJSON() {
        let {id, email, password, token, metas} = this.data;
        return {id, email, password, token, metas};
    }

    static fromJSON(obj) {
        let user = new User();
        user.id = obj.id;
        user.email = obj.email;
        user.password = obj.password;
        user.token = obj.token;
        return user;
    }
}

/* Private Method */
function update(user, callback)
{
    let data = {
        usr_email: user.email,
        usr_password: user.password,
        usr_token: user.token,
    };

    db.query('UPDATE t_user SET ? WHERE usr_id=?', [data, user.id], (err, result) => {
        if (err)
            return callback(err);
        user.hydrate(data);
        callback(null, user);
    });
}

function create(user, callback)
{
     let data = {
         usr_email: user.email,
         usr_password: user.password,
     };

     db.query('INSERT INTO t_user SET ?', data, (err, result) => {
         if (err)
             return callback(err);
         user.hydrate(data);
         user.id = result.insertId;
         callback(null, user);
     });
}


module.exports = User;
