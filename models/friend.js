"use strict";
const db = require('../middlewares/db');
const Promise = require('bluebird');

const User = require('./user');

class Friend {
    constructor() { this.data = {}; return this; }

    /* GETTERS */
    get user1() { return this.data.usr_id_1; }
    get user2() { return this.data.usr_id_2; }
    get userAction() { return this.data.usr_id_action; }
    get status() { return this.data.status; }

    /* SETTERS */
    set user1(v) { this.data.usr_id_1 = v; }
    set user2(v) { this.data.usr_id_2 = v; }
    set userAction(v) { this.data.usr_id_action = v; }
    set status(v) { return this.data.status = v; }

    hydrate(data) {
        this.data = data;
        return this;
    }

    save(done) {
        db.query('REPLACE INTO t_friend (usr_id_1, usr_id_2, usr_id_action, status) VALUES (?, ?, ?, ?)', [this.user1.id || this.user1, this.user2, this.userAction || this.user2, this.status || 0], (err, result) => {
            if (err)
                return done(err);
            return done(null, result);
        });
    }

    delete(done) {
        db.query('DELETE FROM t_friend WHERE usr_id_1 IN (?) AND usr_id_2 IN (?)', [[this.user1.id || this.user1, this.user2], [this.user1.id || this.user1, this.user2]], (err, result) => {
            if (err)
                return done(err);
            return done(null);
        });
    }

    static getRequests(userId, done) {
        db.query('SELECT * FROM t_friend WHERE usr_id_action=? AND status=0', userId, (err, result) => {
            if (err)
                return done(err);
            Promise.each(result, (friend, index) => {
                result[index] = new Friend().hydrate(friend);
                return new Promise((resolve, reject) => {
                    User.findById(result[index].user1, (err, user) => {
                        if (err)
                            return reject(err);

                        user.password = undefined;
                        user.token = undefined;
                        user.getProfile((err) => {
                            if (err)
                                return reject(err);
                            result[index].user1 = user;
                            resolve();
                        })
                    });
                })
            }).then(() => {
                return done(null, result);
            }).catch((err) => {
                return done(err);
            })
        })
    }

    static getRequest(userId1, userId2, done) {
        db.query('SELECT * FROM t_friend WHERE usr_id_1 IN (?) AND usr_id_2 IN (?)', [[userId1, userId2], [userId1, userId2]], (err, result) => {
            if (err)
                return done(err);
            return done(null, result[0] ? new Friend().hydrate(result[0]) : null);
        });
    }

    static getFriends(userId, done) {
        db.query('SELECT * FROM t_friend WHERE (usr_id_1=? OR usr_id_2=?) AND status=1', [userId, userId], (err, result) => {
            if (err)
                return done(err);
            Promise.each(result, (friend, index) => {
                result[index] = new Friend().hydrate(friend);
                if (result[index].user1 === userId) {
                    result[index].user1 = result[index].user2;
                    result[index].user2 = userId;
                }
                return new Promise((resolve, reject) => {
                    User.findById(result[index].user1, (err, user) => {
                        if (err)
                            return reject(err);

                        user.password = undefined;
                        user.token = undefined;
                        user.getProfile((err) => {
                            if (err)
                                return reject(err);
                            result[index].user1 = user;
                            resolve();
                        })
                    });
                })
            }).then(() => {
                return done(null, result);
            }).catch((err) => {
                return done(err);
            })
        })
    }

    /* JSON */
    toJSON() {
        let {user1, user2, userAction, status} = this;
        return {user1, user2, userAction, status};
    }
}

module.exports = Friend;