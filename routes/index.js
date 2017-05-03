const express = require('express');
const router = express.Router();

const userConnection = require('../middlewares/user-connection');

const user = require('./user');

router.get('/', userConnection.logged(), (req, res) => { res.render('index') });

// Register routes
router.route('/register')
    .get(userConnection.notLogged(), (req, res) => { res.render('register') })
    .post([
            userConnection.notLogged({ redirect: '/' }),
            user.registerValidation
        ], (req, res) => { res.redirect('/register') });

// Login routes
router.route('/login')
    .get(userConnection.notLogged(), (req, res) => { res.render('login') })
    .post([
            userConnection.notLogged(),
            user.loginValidation,
            userConnection.connect('/login')
        ], (req, res) => { res.redirect('/') });

router.get('/logout', [userConnection.logged(), userConnection.disconnect], (req, res) => { res.redirect('/login'); });

// Password reset
router.route('/forget')
    .get(userConnection.notLogged(), (req, res) => { res.render('password_forget') })
    .post([
            userConnection.notLogged(),
            user.forgetPasswordValidation,
        ], (req, res) => { res.redirect('/forget'); });

router.route('/reset/:token*')
    .get([
            userConnection.notLogged(),
            user.confirmToken,
        ], (req, res) => { res.render('password_reset', { token: req.user.token }) })
    .post([
            userConnection.notLogged(),
            user.confirmToken,
            user.resetPasswordValidation,
        ], (req, res) => { console.log('salut'); res.redirect('/reset/' + req.user.token) });

// User own profile
router.route('/profile')
    .get(userConnection.logged(), user.profile)
    .post([
        userConnection.logged(),
        user.profilePrivateValidation
    ], (req, res) => { res.redirect('/profile#private')} );

router.post('/profile/public', [
        userConnection.logged(),
        user.profilePublicValidation
    ], (req, res) => { res.redirect('/profile#public') });

router.post('/profile/images', [
        userConnection.logged(),
        user.picsValidation
    ], (req, res) => { res.redirect('/profile#pics') });

router.get('/profile/images/set/:index([0-5])', [
        userConnection.logged(),
        user.setProfilPic
    ], (req, res) => { res.redirect('/profile#pics') });

router.get('/profile/images/delete/:index([0-5])', [
        userConnection.logged(),
        user.deletePic
    ], (req, res) => { res.redirect('/profile#pics') });

// Users public profile
router.get('/profile/:user_id([0-9]+)', [
    userConnection.logged()
    ], user.publicProfile);

module.exports = router;