"use strict";
const mysql = require('mysql');
const db = require('../config/db');
const Promise = require('bluebird');

class UserMeta
{
    constructor () { this.data = { metas: {} }; return this; }

    /* Getters */
    get id() { return this.data.id; }
    get name() { return this.data.name; }
    get value() { return this.data.value; }

    /* Setters */
    set id(id) { this.data.id = id; }
    set name(name) { this.data.name = name; }
    set value(value) { this.data.value = value; }

    hydrate(data) {
        if (!data)
            return false;
        this.id = data.meta_id;
        this.name = data.meta_name;
        this.value = data.meta_value;
        return this;
    }

    static saveMultiple(userId, metas, done) {
        let sql = '';
        metas.forEach((meta) => {
            let tmp = 'INSERT INTO t_user_meta (meta_name, meta_value, usr_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE meta_value=?'
            sql += mysql.format(tmp, [meta.name, meta.value, userId, meta.value]) + ';';
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
            let ret = {};
            Promise.map(result, (meta, id) => {
                ret[meta.meta_name] = new UserMeta().hydrate(meta);
            }).then(() => {
                done(null, ret);
            });
        });
    }

    /* JSON */
    toJSON() {
        let {id, name, value} = this.data;
        return {id, name, value};
    };

    static fromJSON(obj) {
        console.log('From JSON', obj);
    }
}
module.exports = UserMeta;