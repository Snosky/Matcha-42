let validationFunc = undefined;

module.exports = (req, res, next) => {
    if (req.session === undefined) throw Error('user-connection require sessions');

    req.user = req.session.user;
    res.locals.user = req.session.user;
    next();
};

module.exports.use = (func) => {
     validationFunc = func;
};

module.exports.notLogged = (options) => {
    return (req, res, next) => {
        if (req.session.user) {
            if (options && options.redirect && options.redirect !== '')
                return res.redirect(options.redirect);
            return res.redirect('/');
        }
        else
            return next();
    };
};

module.exports.logged = (options) => {
    return (req, res, next) => {
        if (req.session.user) {
            return next();
        }
        else {
            if (options && options.redirect && options.redirect !== '')
                return res.redirect(options.redirect);
            return res.redirect('/login');
        }
    };
};

module.exports.connect = (failureRedirect) => {
    return (req, res, next) => {
        if (req.body.email && req.body.password) {
            validationFunc(req.body.email, req.body.password, (err, user) => {
                if (err)
                    return res.status(500).send('Database error');
                if (!user) {
                    req.flash('error', 'You have entered an invalid username or password.');
                    return res.redirect(failureRedirect);
                }
                req.flash('success', 'You are now connected.');
                req.session.user = user.id;
                return next();
            });
        }
        else
            return res.redirect(failureRedirect);
    };
};

module.exports.disconnect = (req, res, next) => {
    req.session.user = undefined;
    next();
};
