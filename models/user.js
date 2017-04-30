"use strict";
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Promise = require('bluebird');

class User
{
    constructor () { this.data = { metas: {} }; return this; }

    /* Getters */
    get id() { return this.data.id; }
    get email() { return this.data.email; }
    get password() { return this.data.password; }
    get token () { return this.data.token; }

    /* Setters */
    set id(id) { this.data.id = id; }
    set email(email) { this.data.email = email; }
    set password(password) { this.data.password = password; }
    set token(token) { this.data.token = token; }

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

    /*static check(email, password, callback) {
        db.query('SELECT * FROM t_user WHERE usr_email=?', email, (err, user) => {
            if (err)
                return callback(err);
            if (user[0] === undefined)
                return callback(null, null);
            bcrypt.compare(password, user[0].usr_password, (err, result) => {
                if (result === false) {
                    return callback(null, null);
                }
                callback (null, new User().hydrate(user[0]));
            });
        });
    }*/

    static find(callback) {
        db.query('SELECT * FROM t_user', (err, result) => {
            if (err)
                return callback(err);
            Promise.map(result, (user, id) => {
                return result[id] = new User().hydrate(user);
            }).then(() => {
                callback(null, result)
            });
        });
    }

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

    /* TODO : Peut etre pas en static */
    static remove(user_id, callback) {
        db.query('DELETE FROM t_user WHERE usr_id=?', user_id, (err, result) => {
            if (err)
                return callback(err);
            callback(null, result.affectedRows);
        })
    }

    static uniqueEmail(email, callback) {
        db.query('SELECT * FROM t_user WHERE usr_email=?', email, (err, result) =>{
            if (err)
                return callback(err);
            callback(null, result.length);
        })
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

function generateToken()
{

}

/* To Json */
User.prototype.toJSON = function(){
    let {id, email, password, token} = this.data;
    return {id, email, password, token};
};

module.exports = User;
