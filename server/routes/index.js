const express = require('express');
const router = express.Router();

const user = require('./users');

router.post('/authenticate', user.authenticate);

module.exports = router;

//const User = require('../models/user');

/* User exemple */
/*router.route('/users')
    .post((req, res) => {
        let user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;

        user.save(function(err, user){
            if (err)
                res.send(err);
            res.json({ message: 'User created ' + user.username })
        });
    })
    .get((req, res) => {
        User.find((err, users) => {
            if (err)
                res.send(err);
            res.json(users);
        });
    });

router.route('/users/:user_id')
    .get((req, res) => {
        User.findById(req.params.user_id, (err, user) => {
            if (err)
                res.send(err);
            res.json(user);
        });
    })
    .put((req, res) => {
        User.findById(req.params.user_id, (err, user) => {
             if (err)
                 res.send(err);

             user.username = req.body.username;
             user.save((err) => {
                 if (err)
                     res.send(err);

                 res.json({ message: 'User updated' });
             })
        });
    })
    .delete((req, res) => {
        User.delete(req.params.user_id, (err, user) => {
            if (err)
                res.send(err);
            res.json({ message: 'User deleted' });
        })
    });
module.exports = router;*/
