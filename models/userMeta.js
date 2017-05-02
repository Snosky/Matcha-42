"use strict";
const mysql = require('mysql');
const db = require('../config/db');
const Promise = require('bluebird');

class UserMeta
{
    constructor () { this.data = { }; return this; }

    /* Getters */
    get name() { return this.data.name; }
    get value() { return this.data.value; }
    get userId() { return this.data.userId; }

    /* Setters */
    set name(name) { this.data.name = name; }
    set value(value) { this.data.value = value; }
    set userId(id) { this.data.userId = id; }

    hydrate(data) {
        if (!data)
            return false;
        this.name = data.meta_name;
        try {
            this.value = JSON.parse(data.meta_value);
        } catch (e) {
            this.value = data.meta_value;
        }
        this.userId = data.usr_id;
        return this;
    }

    static saveMultiple(metas, done) {
        let sql = '';
        metas.forEach((meta) => {
            if (Array.isArray(meta.value))
                meta.value = JSON.stringify(meta.value);
            let tmp = 'INSERT INTO t_user_meta (meta_name, meta_value, usr_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE meta_value=?'
            sql += mysql.format(tmp, [meta.name, meta.value, meta.userId, meta.value]) + ';';
        });
        db.query(sql, (err, result) => {
            if (err)
                return done(err);
            done(null, result);
        });
    }

    static getUserMetas(userId, done) {
        db.query('SELECT * FROM t_user_meta WHERE usr_id=?', userId, (err, result) => {
            if (err)
                return done(err);
            Promise.map(result, (meta, id) => {
                result[id] = new UserMeta().hydrate(meta);
            }).then(() => {
                done(null, result)
            });
        });
    }

    /* JSON */
    toJSON() {
        let {name, value, userId} = this.data;
        return {name, value, userId};
    };

    static fromJSON(obj) {
        let meta = new UserMeta();
        meta.name = obj.name;
        meta.value = obj.value;
        meta.userId = obj.userId;
        return meta;
    }
}
module.exports = UserMeta;