"use strict";
const mysql = require('mysql');
const db = require('../config/db');
const Promise = require('bluebird');

class Tag
{
    constructor () { this.data = { }; return this; }

    /* Getters */
    get id() { return this.data.id; }
    get value() { return this.data.value; }

    /* Setters */
    set id(id) { this.data.id = id; }
    set value(value) { this.data.value = value; }

    hydrate(data) {
        this.id = data.tag_id;
        this.value = data.tag_content;
        return this;
    }

    static getByUser(user_id, done) {
        db.query('SELECT t_tag.* FROM t_user_has_t_tag AS t_join LEFT JOIN t_tag ON t_tag.tag_id=t_join.tag_id WHERE t_join.usr_id=?', user_id, (err, result) => {
            if (err)
                return done(err);
            map(result, (tags) => {
                return done(null, tags);
            })
        })
    }

    static getAll(done) {
        db.query('SELECT * FROM t_tag', (err, result) => {
            if (err)
                return done(err);
            map(result, (tags) => {
                return done(null, tags);
            })
        });
    }

    static addForUser(user_id, tag_id, done) {
        db.query('INSERT INTO t_user_has_t_tag SET usr_id=?, tag_id=?', [user_id, tag_id], (err, result) => {
            if (err)
                return done(err);
            done(null, result);
        })
    }

    static deleteForUser(user_id, tag_id, done) {
        db.query('DELETE FROM t_user_has_t_tag WHERE usr_id=? AND tag_id=?', [user_id, tag_id], (err, result) => {
            if (err)
                return done(err);
            done(null, result);
        })
    }

    static create(value, done) {
        db.query('INSERT INTO t_tag SET tag_content=?', value, (err, result) => {
            if (err)
                return done(err);
            done(null, result);
        })
    }

    /* JSON */
    toJSON() {
        let {id, value} = this.data;
        return {id, value};
    };

    static fromJSON(obj) {
        let tag = new Tag();
        tag.id = obj.id;
        tag.value = obj.value;
        return tag;
    }
}

const map = (data, done) => {
    Promise.map(data, (tag, index) => {
        data[index] = new Tag().hydrate(tag);
    }).then(() => {
        return done(data);
    })
};

module.exports = Tag;