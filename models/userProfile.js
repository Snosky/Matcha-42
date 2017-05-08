const db = require('../middlewares/db');

const mysql = require('mysql');

class UserProfile {
    constructor (data) {
        this.data = { };
        if (data)
            this.data = data;
        return this;
    }

    /* Getter */
    get userId() { return this.data.usr_id; }
    get firstname() { return this.data.firstname; }
    get lastname() { return this.data.lastname; }
    get sex() { return this.data.sex; }
    get orientation() { return this.data.orientation; }
    get birthday() { return this.data.birthday; }
    get images() { return this.data.images; }
    get profileImage() { return this.data.profileImage; }
    get bio() { return this.data.bio; }
    get geoTimestamp() { return this.data.geoTimestamp; }
    get geoLatitude() { return this.data.geoLatitude; }
    get geoLongitude() { return this.data.geoLongitude; }
    get popularity() { return this.data.popularity; }
    get lastConnection() { return this.data.last_connection; }

    /* Setters */
    set userId(v) { this.data.usr_id = v; }
    set firstname(v) { this.data.firstname = v; }
    set lastname(v) { this.data.lastname = v; }
    set sex(v) { this.data.sex = v; }
    set orientation(v) { this.data.orientation = v; }
    set birthday(v) { this.data.birthday = v; }
    set images(v) { this.data.images = v; }
    set profileImage(v) { this.data.profileImage = v; }
    set bio(v) { this.data.bio = v; }
    set geoTimestamp(v) { this.data.geoTimestamp = v; }
    set geoLatitude(v) { this.data.geoLatitude = v; }
    set geoLongitude(v) { this.data.geoLongitude = v; }
    set popularity(v) { this.data.popularity = v; }
    set lastConnection(v) { this.data.last_connection = v;}

    hydrate(data) {
        this.data = data;
        if (this.images)
            this.images = JSON.parse(data.images);
        return this;
    }

    save(done) {
        let query = 'REPLACE INTO t_user_profile (usr_id, firstname, lastname, sex, orientation, birthday, images, profileImage, bio, geoTimestamp, geoLatitude, geoLongitude, popularity, last_connection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        let data = [
            this.userId,
            this.firstname,
            this.lastname,
            this.sex,
            this.orientation,
            this.birthday,
            Array.isArray(this.images) ? JSON.stringify(this.images) : this.images,
            this.profileImage,
            this.bio,
            this.geoTimestamp,
            this.geoLatitude,
            this.geoLongitude,
            this.popularity,
            this.lastConnection
        ];

        db.query(query, data, (err, result) => {
            if (err)
                return done(err);
            return done(null, result);
        });
    }

    saveLastConnection(done) {
        db.query('UPDATE t_user_profile SET last_connection=? WHERE usr_id=?', [this.lastConnection, this.userId], (err, result) => {
            if (err)
                return done(err);
            done(null);
        })
    }

    get(done) {
        db.query('SELECT *, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday FROM t_user_profile WHERE usr_id=?', this.userId, (err, result) => {
            if (err)
                return done(err);
            this.hydrate(result[0]);
            return done(null);
        })
    }

    /* JSON */
    toJSON() {
        let {firstname, lastname, sex, orientation, birthday, images, profileImage, bio, geoTimestamp, geoLatitude, geoLongitude, popularity, lastConnection} = this.data;
        return {firstname, lastname, sex, orientation, birthday, images, profileImage, bio, geoTimestamp, geoLatitude, geoLongitude, popularity, lastConnection};
    }
}

module.exports = UserProfile;