"use strict";
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Promise = require('bluebird');

class User
{
    constructor () { this.data = {}; return this; }

    /* Getters */
    get id() { return this.data.id; }
    get email() { return this.data.email; }
    get password() { return this.data.password; }
    get activated() { return this.data.activated; }
    get token () { return this.data.token; }

    /* Setters */
    set id(id) { this.data.id = id; }
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
    bcrypt.genSalt(10, (err, salt) => {
         bcrypt.hash(user.password, salt, (err, hash) => {
             let data = {
                 usr_email: user.email,
                 usr_password: hash,
                 usr_activated: 0,
             };

             db.query('INSERT INTO t_user SET ?', data, (err, result) => {
                 if (err)
                     return callback(err);
                 user.hydrate(data);
                 user.id = result.insertId;
                 callback(null, user);
             });
         });
    });
}

function generateToken()
{

}

/* To Json */
User.prototype.toJSON = function(){
    let {id, email, password, activated, token} = this.data;
    return {id, email, password, activated, token};
};

module.exports = User;
