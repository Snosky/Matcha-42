"use strict";
const db = require('../middlewares/db');
const Promise = require('bluebird');

class Message {
    constructor() { this.data = {}; return this; }

    /* GETTERS */
    get id() { return this.data.msg_id; }
    get emitter() { return this.data.usr_id_emit; }
    get target() { return this.data.usr_id_target; }
    get message() { return this.data.msg_message; }
    get status() { return this.data.msg_status; }
    get date() { return this.data.msg_date; }

    /* SETTERS */
    set id(v) { this.data.msg_id = v; }
    set emitter(v) { this.data.usr_id_emit = v; }
    set target(v) { this.data.usr_id_target = v; }
    set message(v) { this.data.msg_message = v; }
    set status(v) { this.data.msg_status = v; }
    set date(v) { this.data.msg_date = v; }

    hydrate(data) {
        this.data = data;
        return this;
    }

    save(done) {
        db.query('INSERT INTO t_message (usr_id_emit, usr_id_target, msg_message, msg_status) VALUES (?, ?, ?, 0)', [this.emitter, this.target, this.message], (err, result) => {
            if (err)
                return done(err);
            this.id = result.insertId;
            this.date = new Date();
            done(null);
        })
    }

    static getAll(id1, id2, done) {
        db.query('SELECT * FROM t_message WHERE usr_id_emit IN (?) ANd usr_id_target IN (?) ORDER BY msg_date ASC', [[id1, id2], [id1, id2]], (err, result) => {
            if (err)
                return done(err);

            Promise.each(result, (message, index) => {
                result[index] = new Message().hydrate(message);
            }).then(() => {
                return done(null, result);
            })
        })
    }

    static setRead(emitter, target, done) {
        db.query('UPDATE t_message SET msg_status=1 WHERE usr_id_emit=? ANd usr_id_target=?', [emitter, target], (err, result) => {
            if (err)
                return done(err);
            done(null, result.affectedRows);
        });
    }

    static countUnread(emitter, target, done) {
        db.query('SELECT COUNT(*) as count FROM t_message WHERE usr_id_emit=? ANd usr_id_target=? AND msg_status=0', [emitter, target], (err, result) => {
            if (err)
                return done(err);
            return done(null, result[0].count);
        });
    }

    static countTotalUnread(target, done) {
        db.query('SELECT COUNT(*) AS count FROM t_message LEFT JOIN t_friend ON (t_friend.usr_id_1=? OR t_friend.usr_id_2=1) AND t_friend.status=1 WHERE usr_id_target=? AND msg_status=0 AND usr_id_emit IN (t_friend.usr_id_1, t_friend.usr_id_2)', [target, target], (err, result) => {
            if (err)
                return done(err);
            return done(null, result[0].count);
        });
    }

    /* JSON */
    toJSON() {
        let {id, emitter, target, message, status, date} = this;
        return {id, emitter, target, message, status, date};
    }
}

module.exports = Message;