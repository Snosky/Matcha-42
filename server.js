const express = require('express');
const path = require('path');
const http = require('http');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

app.use(logger('dev'));

app.use(helmet());

app.set('secret', '8Hs4swtfq3$mw4-Rdwbw6N+CB_3LW?hE#ZzFK?@@rpuH7dR!#r_5Ld+tMjwA_gADJPu68wSwVp+uwH6V%=huS*K^#pteb*_rb9-9st4UpS&q4?r+fGJ$3dMguLBauracmH!?hqH5Sx5?VhMy!LPPEFf?r49+RJURMJW-Ks^Bkk*%RhLEAM#XK8#vnVUdpwy+5&s_S#$#Bc7&fj9wb5+_bN%rJgc%kY6V-fxdC%^=UGvDmweGej+bK=JV@vQmV=kC');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'dist')));

// API
app.use('/api/v1/*', (req, res, next) => {
    console.log('Something is happening');
    next();
});

const routes = require('./server/routes');
app.use('/api/v1', routes);

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


