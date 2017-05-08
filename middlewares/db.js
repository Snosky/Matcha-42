const mysql = require('mysql');
const config = require('../config/db');

const db = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true
});

module.exports = db;
