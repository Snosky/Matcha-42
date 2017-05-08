"use strict";
const db = require('../middlewares/db');

class Report {
    constructor() { this.data = {}; return this; }

    /* GETTERS */
    get emitter() { return this.data.usr_id_emitter; }
    get target() { return this.data.usr_id_target; }

    /* SETTERS */
    set emitter(v) { this.data.usr_id_emitter = v; }
    set target(v) { this.data.usr_id_target = v; }

    hydrate(data) {
        this.data = data;
    }

    save(done) {
        db.query('INSERT INTO t_report SET usr_id_emitter=?, usr_id_target=?', [this.emitter, this.target], (err, result) => {
            if (err)
                return done(err);
            done(null);
        });
    }
}

module.exports = Report;