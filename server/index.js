const express = require('express');
const bodyParser = require('body-parser');

const jsonEasyResponse = require('./middlewares/json-easy-response');
const formValidator = require('./middlewares/form-validator');

const app = express();

app.set('angular_token', 'TRJq7Zq6w');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(formValidator);
app.use(jsonEasyResponse);

const routes = require('./routes');
app.use('/api', routes);

module.exports = app;
