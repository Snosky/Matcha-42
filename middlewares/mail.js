const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'matcha.4242@gmail.com',
        pass: 'matcha42'
    }
});