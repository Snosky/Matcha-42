"use strict"
const Promise = require('bluebird');
const db = require('../middlewares/db');

const User = require('./user');

class Notification {
    constructor() { this.data = {}; return this; }

    /* GETTERS */
    get id() { return this.data.notif_id; }
    get emitter() { return this.data.usr_id_emitter; }
    get target() { return this.data.usr_id_target; }
    get type() { return this.data.notif_type; }
    get time() { return this.data.notif_time; }
    get status() { return this.data.notif_status; }

    /* SETTER */
    set id(v) { this.data.notif_id = v; }
    set emitter(v) { this.data.usr_id_emitter = v; }
    set target(v) { this.data.usr_id_target = v; }
    set type(v) { this.data.notif_type = v; }
    set time(v) { this.data.notif_time = v; }
    set status(v) { this.data.notif_status = v; }

    hydrate(data) {
        this.data = data;
        return this;
    }

    save(done) {
        if (this.id)
            update(this, done);
        else
            insert(this, done);
    }

    exist(done) {
        if (this.type !== 'PROFILE_VIEW')
            return done(null, 0);

        db.query('SELECT * FROM t_notification WHERE notif_type="PROFILE_VIEW" AND usr_id_emitter=? AND usr_id_target=?', [this.emitter.id, this.target], (err, result) => {
            if (err)
                return done(err);
            return done(null, result.length);
        });
    }

    static getUnread(target, done) {
        db.query('SELECT * FROM t_notification WHERE usr_id_target=? AND notif_status=0', target, (err, result) => {
            if (err)
                return done(err);

            Promise.each(result, (notif, index) => {
                result[index] = new Notification().hydrate(notif);
                return new Promise((resolve, reject) => {
                    User.findById(result[index].emitter, (err, user) => {
                        if (err)
                            return reject(err);

                        user.password = undefined;
                        user.token = undefined;

                        user.getProfile((err) => {
                            if (err)
                                return reject(err);
                            result[index].emitter = user;
                            return resolve();
                        });
                    });
                })

            }).then(() => {
                return done(null, result);
            }).catch((err) => {
                return done(err);
            });
        })
    }

    static getAllFromUser(userId, done) {
        db.query('SELECT * FROM t_notification WHERE usr_id_target=? ORDER BY notif_time DESC', userId, (err, result) => {
            if (err)
                return done(err);
            Promise.each(result, (notif, index) => {
                result[index] = new Notification().hydrate(notif);
                return new Promise((resolve, reject) => {
                    User.findById(result[index].emitter, (err, user) => {
                        if (err)
                            return reject(err);

                        user.password = undefined;
                        user.token = undefined;

                        user.getProfile((err) => {
                            if (err)
                                return reject(err);
                            result[index].emitter = user;
                            return resolve();
                        });
                    });
                })
            }).then(() => {
                return done(null, result);
            }).catch((err) => {
                return done(err);
            });
        })
    }

    static setReadForUser(userId, done) {
        db.query('UPDATE t_notification SET notif_status=1 WHERE notif_status=0 AND usr_id_target=?', userId, (err, result) => {
            if (err)
                return done(err);
            done(null);
        })
    }

    static saveMultiples(notifs, done) {
        Promise.each(notifs, (notif) => {
            return new Promise((resolve, reject) => {
                insert(notif, (err, result) => {
                    if (err)
                        return reject(err);
                    return resolve();
                })
            })
        }).then(() => {
            return done(null);
        }).catch((err) => {
            return done(err);
        })
    };

    /* JSON */
    toJSON() {
        let {id, emitter, target, type, time, status} = this;
        return {id, emitter, target, type, time, status};
    }

    static fromJSON(data) {
        let notif = new Notification();
        notif.id = data.id;
        notif.emitter = User.fromJSON(data.emitter);
        notif.target = data.target;
        notif.type = data.type;
        notif.time = data.time;
        notif.status = data.status;
        return notif;
    }
}

const insert = (notif, done) => {
    db.query('INSERT INTO t_notification SET usr_id_emitter=?, usr_id_target=?, notif_type=?, notif_status=0', [notif.emitter.id || notif.emitter, notif.target.id || notif.target, notif.type], (err, result) => {
        if (err)
            return done(err);
        notif.id = result.insertId;
        notif.time = Date.now();
        return done(null, result);
    });
};

const update = (notif, done) => {
    db.query('UPDATE t_notification SET notif_status=1 WHERE usr_id_target=?', [notif.target.id || notif.target], (err, result) => {
        if (err)
            return done(err);
        return done(null, result);
    });
};

module.exports = Notification;