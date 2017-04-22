const User = require('../models/user');
const pw = require('credential')();
const jwt = require('jsonwebtoken');

module.exports = {
    authenticate: function(req, res) {
        User.findByUsername(req.body.username, (err, user) => {
            if (err)
                res.send(err);

            if (!user)
                res.send({ success: false, err: 'not_found' });

            pw.verify(user.password, req.body.password, (err, isValid) => {
                if (err)
                    return res.json({ success: false, err: 'pw_verification_failed' });

                if (!isValid)
                    return res.json({ success: false, err: 'not_found' });

                const token = jwt.sign(user, '8Hs4swtfq3$mw4-Rdwbw6N+CB_3LW?hE#ZzFK?@@rpuH7dR!#r_5Ld+tMjwA_gADJPu68wSwVp+uwH6V%=huS*K^#pteb*_rb9-9st4UpS&q4?r+fGJ$3dMguLBauracmH!?hqH5Sx5?VhMy!LPPEFf?r49+RJURMJW-Ks^Bkk*%RhLEAM#XK8#vnVUdpwy+5&s_S#$#Bc7&fj9wb5+_bN%rJgc%kY6V-fxdC%^=UGvDmweGej+bK=JV@vQmV=kC', {
                    expiresIn: 1440
                });

                res.json({
                    success: true,
                    token: token
                });
            });
        });
    }
};
