"use strict";
const bcrypt = require('bcrypt');
const db = require('../middlewares/db');
const Promise = require('bluebird');

const UserProfile = require('./userProfile');

class User
{
    constructor () {
        this.data = { };
        this.userprofile = new UserProfile();
        this.profile.userId = this.id;
        return this; }

    /* Getters */
    get id() { return this.data.id; }
    get email() { return this.data.email; }
    get password() { return this.data.password; }
    get token () { return this.data.token; }
    get metas () { return this.data.metas; }
    get profile() { return this.userprofile; }

    /* Setters */
    set id(id) { this.data.id = id; }
    set email(email) { this.data.email = email; }
    set password(password) { this.data.password = password; }
    set token(token) { this.data.token = token; }
    set metas(metas) { this.data.metas = metas; }

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
                this.token = token.replace('/', '');
                this.save((err, user) => {
                    if (err)
                        return done(err);
                    done(null, user);
                });
            });
        });
    }

    saveProfile(done) {
         this.profile.userId = this.id;
         this.profile.save(done);
    }

    getProfile(done) {
         this.profile.userId = this.id;
         this.profile.get(done);
    }

    getMatch(options, done) {
        const mysql = require('mysql');

        const lat = mysql.escape(this.profile.geoLatitude);
        const long = mysql.escape(this.profile.geoLongitude);

        let req = `
            SELECT
                user.usr_id,
                (6371 * ACOS(COS(RADIANS(profile.geoLatitude)) * COS(RADIANS(${lat})) * COS(RADIANS(${long}) - RADIANS(profile.geoLongitude)) + SIN(RADIANS(profile.geoLatitude)) * SIN(RADIANS(${lat})))) AS distance,
                DATE_FORMAT(NOW(), '%Y') - DATE_FORMAT(profile.birthday, '%Y') age,
                COUNT(tags.tag_id) tagCount,
                MatchScore(
                    (6371 * ACOS(COS(RADIANS(profile.geoLatitude)) * COS(RADIANS(${lat})) * COS(RADIANS(${long}) - RADIANS(profile.geoLongitude)) + SIN(RADIANS(profile.geoLatitude)) * SIN(RADIANS(${lat})))),
                    COUNT(tags.tag_id),
                    DATE_FORMAT(profile.birthday, '%Y') - DATE_FORMAT(${mysql.escape(this.profile.birthday)}, '%Y')
                ) AS score
            FROM t_user user
            LEFT JOIN t_user_profile profile ON profile.usr_id=user.usr_id
            LEFT JOIN t_user_has_t_tag tags ON tags.usr_id=user.usr_id`;

        if (options && options.tags !== '')
            req += ' AND tags.tag_id IN (' + options.tags + ')';
        else if (!options)
            req += ` AND tags.tag_id IN (SELECT tag_id FROM t_user_has_t_tag WHERE usr_id=${mysql.escape(this.id)})`;

        req += ` WHERE
                user.usr_id!=?
                AND user.usr_id NOT IN (SELECT usr_id_1 FROM t_friend WHERE status=2 AND usr_id_2=${mysql.escape(this.id)})
                AND user.usr_id NOT IN (SELECT usr_id_2 FROM t_friend WHERE status=2 AND usr_id_1=${mysql.escape(this.id)})
                AND profile.sex IN (?)
                AND profile.orientation IN (?)`;

        if (options)
            req += ' AND profile.popularity >= ' + mysql.escape(options.minPopularity) + ' AND profile.popularity <= ' + mysql.escape(options.maxPopularity);

        req += ' GROUP BY tags.usr_id';
        if (options)
            req += ` HAVING 
                        age >= ${mysql.escape(options.minAge)}
                        AND age <= ${mysql.escape(options.maxAge)}`;
        if (options && options.maxLocation !== '0')
            req += `AND distance <= ${mysql.escape(options.maxLocation)}`;

        req += ' ORDER BY ';

        let direction = 'DESC';
        if (options && options.orderDirection)
            direction = options.orderDirection === 'ASC' ? ' ASC' : ' DESC';

        if (options && options.order) {
            switch(options.order) {
                case 'age':
                    req += 'age ' + direction;
                    break;

                case 'location':
                    req += 'distance ' + direction;
                    break;

                case 'popularity':
                    req += 'profile.popularity ' + direction;
                    break;

                case 'tags':
                    req += 'tagCount ' + direction;
                    break;

                default:
                    req += 'score ' + direction;
            }
        } else {
            req += 'score ' + direction + ', profile.popularity ' + direction;
        }

        let matchSex = this.profile.orientation;
        let matchOrientation = [this.profile.sex, 'bi'];
        if (this.profile.orientation === 'bi')
            matchSex = ['woman', 'man'];

        let data = [this.id, matchSex, matchOrientation];

        db.query(req, data, (err, result) => {
            if (err)
                return done(err);
            Promise.each(result, (user, index) => {
                result[index] = new User().hydrate(user);
                return new Promise((resolve, reject) => {
                    result[index].getProfile((err) => {
                        if (err)
                            return reject(err);
                        result[index].profile.score = user.score;
                        result[index].profile.distance = user.distance;
                        result[index].profile.commonTags = user.commonTags;
                        resolve();
                    })
                })
            }).then(() => {
                done(null, result);
            }).catch((err) => {
                return done(err);
            });
        })
    }

    /* == STATIC FUNCTIONS == */

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

    static uniqueEmail(email, callback) {
        db.query('SELECT * FROM t_user WHERE usr_email=?', email, (err, result) =>{
            if (err)
                return callback(err);
            callback(null, result.length);
        })
    }

    /* JSON */
    toJSON() {
        let profile = this.profile.toJSON();
        let {id, email, password, token} = this.data;
        return {id, email, password, token, profile};
    }

    static fromJSON(obj) {
        let user = new User();
        user.id = obj.id;
        user.email = obj.email;
        user.password = obj.password;
        user.token = obj.token;
        return user;
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


module.exports = User;
