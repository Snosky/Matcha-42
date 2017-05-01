const express = require('express');

const email = require('../middlewares/mail');

const User = require('../models/user');
const UserMeta = require('../models/userMeta');

/**
 * Return all users
 * @param req
 * @param res
 */
module.exports.getUsers = (req, res) => {
    res.send('Hello World');
};

/**
 * Return one user with request params ID
 * @param req
 * @param res
 */
module.exports.getUser = (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err)
            return res.send(err);

        if (!user)
            return res.send('user not found');

        res.json(user);
    });
};

/**
 * Create a new user
 * @param req
 * @param res
 * @param next
 */
module.exports.registerValidation = (req, res, next) => {
    req.bodyCheck('sex', 'Sex is not valid.').isRequired().isIn(['man', 'woman']);
    req.bodyCheck('orientation', 'Orientation is not valid.').isRequired().isIn(['man', 'woman', 'bi']);

    req.bodyCheck('firstname', 'First name is not valid').isRequired();
    req.bodyCheck('lastname', 'Last name is not valid').isRequired();

    req.bodyCheck('birthday', 'Birthday is not valid.').isRequired().isDate();

    req.bodyCheck('email', 'Email is not valid.').isRequired().isEmail();
    req.bodyCheck('email', 'Email is already used.').isUnique(User.uniqueEmail);

    req.bodyCheck('password', 'Passwords do not match.').isRequired().equalTo(req.body.passwordConf);
    req.bodyCheck('password', 'Your password must have at least 1 uppercase letter, 1 number and be 6 character long.')
        .test(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/);

    req.isFormValid()
        .then(
            valid => {
                if (valid === false) {
                    return next();
                }

                let user = new User();
                user.email = req.body.email;
                user.password = req.body.password;
                user.hashPassword(() => {
                    user.save((err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send('Database error');
                        }

                        let metas = [
                            { name: 'sex', value: req.body.sex },
                            { name: 'orientation', value: req.body.orientation },
                            { name: 'firstname', value: req.body.firstname },
                            { name: 'lastname', value: req.body.lastname },
                            { name: 'birthday', value: req.body.birthday }
                        ];

                        UserMeta.saveMultiple(user.id, metas, (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send('Database error');
                            }

                            return res.redirect('/login');
                        });
                    });
                });
            }
        )
        .catch(
            error => {
                res.status(500).send('Database error');
                console.error(error);
            }
        )
};

/**
 * Validate the login
 * @param req
 * @param res
 * @param next
 */
module.exports.loginValidation = (req, res, next) => {
    req.bodyCheck('email', 'Email is required.').isRequired().isEmail();
    req.bodyCheck('password', 'Password is required.').isRequired();

    req.isFormValid()
        .then(valid => { next(); } )
        .catch(
            error => {
                res.status(500).send('Server error');
                console.log(error);
            }
        )
};

/**
 * Validation of the password forget form
 * @param req
 * @param res
 * @param next
 */
module.exports.forgetPasswordValidation = (req, res, next) => {
    req.bodyCheck('email', 'Email is required.').isRequired().isEmail();

    req.isFormValid()
        .then(valid => {
            if (valid === false)
                return next();

            req.flash('success', 'An email has been send to you.');

            User.findByEmail(req.body.email, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Database error');
                }

                if (user) {
                    user.generateToken((err, user) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send('Database error');
                        }

                        let mailOptions = {
                            from: '"Matcha 42" <matcha.4242@gmail.com>',
                            to: user.email,
                            subject: 'Matcha - Password reset',
                            text: `Please copy/past this link to reset your password http://localhost:3000/reset/${user.token}`,
                            html: `Please click <a href="http://localhost:3000/reset/${user.token}">click here</a> to reset your password.`
                        };

                        email.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send('Server error');
                            }
                            return res.redirect('/login');
                        });
                    });
                }
                else
                    return res.redirect('/login');
            });
        } )
        .catch(
            error => {
                res.status(500).send('Server error');
                console.log(error);
            }
        )
};

/**
 * Confirm user with tokne exist
 * @param req
 * @param res
 * @param next
 */
module.exports.confirmToken = (req, res, next) => {
    let token = req.params.token;

    User.findByToken(token, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error');
        }

        if (!user) {
            return res.redirect('/login');
        }

        req.user = user;
        next();
    });
};

module.exports.resetPasswordValidation = (req, res, next) => {
    req.bodyCheck('password', 'Passwords do not match.').isRequired().equalTo(req.body.passwordConf);
    req.bodyCheck('password', 'Your password must have at least 1 uppercase letter, 1 number and be 6 character long.')
        .test(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/);

    req.isFormValid()
        .then(
            valid => {
                if (valid === false)
                    return next();

                let user = req.user;
                user.password = req.body.password;
                user.token = null;
                user.hashPassword(() => {
                    user.save((err, user) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Database error');
                        }
                        req.user = undefined;
                        req.flash('success', 'Password reset.');
                        return res.redirect('/login');
                    });
                });
            }
        )
};
