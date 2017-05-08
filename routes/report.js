const User = require('../models/user');
const Report = require('../models/report');

module.exports.index = (req, res) => {
    let backUrl = req.header('Referer') || '/';

    let report = new Report();
    report.emitter = req.user.id;
    report.target = req.params.id;
    report.save((err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                req.flash('error', 'You already report this user.');
                return res.redirect(backUrl);
            }
            console.error(err);
            return res.status(500).send('Database error');
        }

        User.findById(req.params.id, (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            if (!user)
                res.redirect(backUrl);

            user.getProfile((err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database error');
                }
                user.profile.popularity -= 2;
                if (user.profile.popularity < 0)
                    user.profile.popularity = 0;
                user.saveProfile((err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error');
                    }
                    req.flash('success', 'User report');
                    res.redirect(backUrl);
                })
            })
        });
    });
};