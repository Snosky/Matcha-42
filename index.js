const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const bcrypt = require('bcrypt');

const formValidator = require('./middlewares/form-validator');
const userConnection = require('./middlewares/user-connection');

const User = require('./models/user');

const app = express();

app.set('view engine', 'pug');
app.use(express.static('public'));

app.set('sessionMiddleware', session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(app.get('sessionMiddleware'));
app.use(cookieParser('keyboard cat'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(formValidator);
app.use(flash());

app.use(userConnection);
userConnection.use((email, password, done) => {
    User.findByEmail(email, (err, user) => {
        if (err)
            return done(err);
        if (!user)
            return done(null, false);

        user.verifyPassword(password, (result) => {
            if (result === false)
                return done(null, false);

            if (user.token) {
                user.token = null;
                user.save((err, user) => {
                    if (err)
                        return done(err);
                    return done(null, user);
                });
            } else {
                return done(null, user);
            }
        });
    });
});

userConnection.ifConnected((user, done) => {
    user = User.fromJSON(user);
    user.getProfile((err) => {
        if (err)
            return done(err);
        return done(null, user);
    })
});

const routes = require('./routes');
app.use('/', routes);

module.exports = app;

/*
    TODO : Limiter tailler message et bio
 */
