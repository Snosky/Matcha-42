const express = require('express');
const fs = require('fs');

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

                        user.setMetas([
                            { name: 'sex', value: req.body.sex },
                            { name: 'orientation', value: req.body.orientation },
                            { name: 'firstname', value: req.body.firstname },
                            { name: 'lastname', value: req.body.lastname },
                            { name: 'birthday', value: req.body.birthday },
                            { name: 'bio', value: null },
                        ]);

                        user.saveMetas((err, result) => {
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

/**
 * Valid reset password form and save password if valid
 * @param req
 * @param res
 * @param next
 */
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

/**
 * Valid private profile form and save
 * @param req
 * @param res
 * @param next
 */
module.exports.profilePrivateValidation = (req, res, next) => {
    req.user.verifyPassword(req.body.password, valid => {
        if (valid) {

            req.user.password = req.body.password;

            if (req.body.email && req.user.email !== req.body.email) { // Only if email is different
                req.bodyCheck('email', 'Email is not valid.').isRequired().isEmail();
                req.bodyCheck('email', 'Email is already used.').isUnique(User.uniqueEmail);
                req.user.email = req.body.email;
            }

            if (req.body.newPassword && req.body.newPassword !== '') {
                req.bodyCheck('newPassword', 'Passwords do not match.').equalTo(req.body.newPasswordConf);
                req.bodyCheck('newPassword', 'Your password must have at least 1 uppercase letter, 1 number and be 6 character long.')
                    .test(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/);
                req.user.password = req.body.newPassword;
            }

            req.isFormValid().then(
                valid => {
                    if (valid === false)
                        return next();

                    req.user.hashPassword(() => {
                        req.user.save((err, user) => {
                            if (err)
                                return res.status(500).send('Database error');
                            req.flash('success', 'Profile updated.');
                            return next();
                        });
                    });
                }
            );


        } else {
            req.flash('error', 'Password is not valid.');
            return next();
        }
    });
};

/**
 * Valid and save public profile form
 * @param req
 * @param res
 * @param next
 */
module.exports.profilePublicValidation = (req, res, next) => {
    req.bodyCheck('sex', 'Sex is not valid.').isRequired().isIn(['man', 'woman']);
    req.bodyCheck('orientation', 'Orientation is not valid.').isRequired().isIn(['man', 'woman', 'bi']);

    req.bodyCheck('firstname', 'First name is not valid').isRequired();
    req.bodyCheck('lastname', 'Last name is not valid').isRequired();

    req.isFormValid().then(
        valid => {
            if (valid === false)
                return next();

            req.user.setMetas([
                { name: 'sex', value: req.body.sex },
                { name: 'orientation', value: req.body.orientation },
                { name: 'firstname', value: req.body.firstname },
                { name: 'lastname', value: req.body.lastname },
                { name: 'bio', value: req.body.bio || req.user.metas.bio }
                //{ name: 'images', value: ['img1', 'img2', 'img3', 'img4', 'img5']}
            ]);

            req.user.saveMetas((err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Database error');
                }
                req.flash('success', 'Public profile updated.');
                return next();
            });
        }
    );
};

/**
 * Valid, upload and save images
 * @param req
 * @param res
 * @param next
 */
module.exports.picsValidation = (req, res, next) => {

    const upload = require('../middlewares/upload-images');
    let userImages = req.user.getMeta('images');
    userImages = userImages ? userImages.value : [];

    upload.array('images', 5 - userImages.length)(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                req.flash('error', 'Too many files, max files allowed ' + (5 - userImages.length));
                return next();
            } else {
                console.log(err);
                return res.status(500).send('Server error');
            }
        }

        req.files.forEach((file) => {
            userImages.push(file.filename);
        });

        req.user.setMeta('images', userImages);
        req.user.saveMetas((err, result) => {
            if (err) {
                req.files.forEach((file) => {
                    fs.unlink(file.path);
                });
                res.status(500).send('Database error');
            }

            req.flash('success', 'Images added.');
            next();
        });
    });
};

/**
 * Set the profil pics (Params index = meta images array index)
 * @param req
 * @param res
 * @param next
 */
module.exports.setProfilPic = (req, res, next) => {

    let userImages = req.user.getMeta('images');

    if (userImages && userImages.value[req.params.index]) {
        req.user.setMeta('profile-image', userImages.value[req.params.index]);
        req.user.saveMetas((err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Database error');
            }
            req.flash('success', 'Profile pic set.');
            next();
        });
    }
};

module.exports.deletePic = (req, res, next) => {
    let userImages = req.user.getMeta('images');

    if (userImages && userImages.value[req.params.index]) {
        fs.unlink('public/images_upload/' + userImages.value[req.params.index], (err) => {
            if (err)
                console.error(err);
        });
        userImages.value.splice(req.params.index, 1);

        req.user.saveMetas((err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            req.flash('success', 'Image deleted.');
            return next();
        })
    } else {
        req.flash('error', 'Image not found.');
        return next();
    }
};