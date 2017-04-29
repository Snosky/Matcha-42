const express = require('express');
const router = express.Router();

const user = require('./user');

router.get('/', (req, res) => { res.render('index') });
router.get('register', (req, res) => { res.render('index') });

router.route('/user')
    .get(user.getUsers)
    .post(user.createUser)
    .all(function(req, res){
        res.status(403);
        res.send('Forbidden');
    });

router.route('/user/:id([0-9]+)')
    .get(user.getUser);

module.exports = router;


// Routes de connexion, Creer session coter serveur avec id user pour savoir si c'est bien lui qui envoi les requetes update de compte

// Pour token
// Premiere connexion au site (pas user mais juste ouverture) echange de token unique, client le save, durabilite 24h
// Stocker le token dans session coter serveur
// A chaque envoi de requete verifier le token ?
// TODO : Regarder Oauth 2
