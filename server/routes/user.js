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
module.exports.createUser = (req, res) => {
    req.bodyCheck('email', 'Email is not valid.').isEmail();
    req.bodyCheck('email', 'Email is already used.').isUnique(User.uniqueEmail);
    req.bodyCheck('password', 'Your password must have at least 1 uppercase letter, 1 number and be 6 character long.')
        .test(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/);

    //res.send('Working...');
    req.isFormValid().then(
        result => {
            if (result.isValid)
                res.json('ok');
            else
                res.send(result.messages)
        },
        error => {
            res.send('404');
            console.log(error);
        }
    );
};
