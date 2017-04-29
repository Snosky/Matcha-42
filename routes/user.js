const express = require('express');

const User = require('../models/user');

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
 */
module.exports.registerValidation = (req, res) => {
    req.bodyCheck('sex', 'Sex is not valid.').isRequired().isIn(['man', 'woman']);
    req.bodyCheck('orientation', 'Orientation is not valid.').isRequired().isIn(['man', 'woman', 'bi']);

    req.bodyCheck('firstname', 'First name is not valid').isRequired();
    req.bodyCheck('lastname', 'Last name is not valid').isRequired();
console.log(req.body.birthday);
    req.bodyCheck('birthday', 'Birthday is not valid.').isRequired().isDate();

    req.bodyCheck('email', 'Email is not valid.').isRequired().isEmail();
    req.bodyCheck('email', 'Email is already used.').isUnique(User.uniqueEmail);

    req.bodyCheck('password', 'Passwords do not match.').isRequired().equalTo(req.body.passwordConf);
    req.bodyCheck('password', 'Your password must have at least 1 uppercase letter, 1 number and be 6 character long.')
        .test(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/);

    req.isFormValid().then(
        result => {
            if (result.isValid === false) // Invalid data
                return res.status(400).json(result.messages);

            // Save user
            let user = new User();
            user.email = req.body.email;
            user.password = req.body.password;
            user.save((err, userRegistered) => {
                if (err) {
                    console.error(err);
                    return res.status('500').json('Database error');
                }
                console.log(userRegistered);
                return res.status(200).json(userRegistered);
            });
        },
        error => {
            res.status(500).json('Error');
            console.error(error);
        }
    );
};
