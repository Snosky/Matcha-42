"use strict";
const mysql = require('mysql');
const db = require('../config/db');

class UserMeta
{
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
}

module.exports = UserMeta;