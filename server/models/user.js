"use strict";
const credential = require('credential');
const db = require('../config/db');
const Promise = require('bluebird');

/* TODO : Use bcrypt instead of credential */

const pw = credential();

class User
{
    constructor () { this.data = {}; return this; }

    /* Getters */
    get id() { return this.data.id; }
    get username() { return this.data.username; }
    get email() { return this.data.email; }
    get password() { return this.data.password; }
    get activated() { return this.data.activated; }
    get token () { return this.data.token; }

    /* Setters */
    set id(id) { this.data.id = id; }
    set username(username) { this.data.username = username; }
    set email(email) { this.data.email = email; }
    set password(password) { this.data.password = password; }
    set activated(activated) { this.data.activated = activated; }
    set token(token) { this.data.token = token; }

    /* Method */
    hydrate(data)
    {
        if (!data)
            return false;
        this.id = data.usr_id;
        this.username = data.usr_username;
        this.email = data.usr_email;
        this.password = data.usr_password;
        this.activated = data.usr_activated;
        this.token = data.usr_token;
        return this;
    }

    save(callback)
    {
        if (this.id) // Update
            update(this, callback);
        else
            create(this, callback);
    }

    static find(callback)
    {
        db.query('SELECT * FROM t_user', (err, result) => {
            if (err)
                return callback(err);
            Promise.map(result, (user, id) => {
                return result[id] = new User().hydrate(user);
            }).then(() => {
                console.log('Done');
                callback(null, result)
            });
        });
    }

    static findById(user_id, callback)
    {
        db.query('SELECT * FROM t_user WHERE usr_id=?', user_id, (err, result) => {
            if (err)
                return callback(err);

            callback(null, new User().hydrate(result[0]));
        });
    }

    static findByUsername(username, callback)
    {
        db.query('SELECT * FROM t_user WHERE usr_username=?', username, (err, result) => {
            if (err)
                return callback(err);
            callback(null, new User().hydrate(result[0]));
        });
    }

    /* TODO : Peut etre pas en static */
    static remove(user_id, callback)
    {
        db.query('DELETE FROM t_user WHERE usr_id=?', user_id, (err, result) => {
            if (err)
                return callback(err);
            callback(null, result.affectedRows);
        })
    }

    static uniqueEmail(email, callback)
    {
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
        usr_username: user.username,
        usr_email: user.email,
        usr_password: user.password,
        usr_activated: user.activated,
    };

    db.query('UPDATE t_user SET ? WHERE usr_id=?', [data, user.id], (err, result) => {
        if (err)
            return callback(err);
        callback(null, user);
    });
}

function create(user, callback)
{
    pw.hash(user.password, (err, hash) => {
        if (err)
            return callback(err);

        let data = {
            usr_username: user.username,
            usr_email: user.email,
            usr_password: hash,
            usr_activated: 0,
        };

        db.query('INSERT INTO t_user SET ?', data, (err, result) => {
            if (err)
                return callback(err);
            user.id = result.insertId;
            callback(null, user);
        });
    });
}

function generateToken()
{

}

/* To Json */
User.prototype.toJSON = function(){
    let {id, username, email, password, activated, token} = this;
    return {id, username, email, password, activated, token};
};

module.exports = User;
