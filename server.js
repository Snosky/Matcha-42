const express = require('express');
const path = require('path');
const http = require('http');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

app.use(logger('dev'));

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'dist')));

// API
app.use('/api/*', (req, res, next) => {
    console.log('Something is happening');
    next();
});

const routes = require('./server/routes');
app.use('/api', routes);

// All others routes
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Port from env
const port = process.env.PORT || '3000';
app.set('port', port);

// HTTP Server
const server = http.createServer(app);

// Mysql
const db = require('./server/config/db');

db.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return false;
    }
    // Listen on port
    server.listen(port, function(){ console.log(`API running on localhost:${port}`)});
});


