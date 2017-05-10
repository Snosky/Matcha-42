const Tag = require('../models/tag');
const User = require('../models/user');

module.exports.index = (req, res) => {
    Tag.getAll((err, tags) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error');
        }

        Tag.getByUser(req.user.id, (err, userTags) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Database error');
            }

            req.user.getMatch(null, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Database error');
                }


                res.render('index', {
                    tags: tags,
                    userTags: userTags,
                    matchs: result
                })
            });
        });
    });
};

module.exports.socket = (io, client) => {

    const matchSearch = (options) => {
        tags = options.tags.join(', ');

        let reqOptions = {
            minAge: options.age[0],
            maxAge: options.age[1],
            minPopularity: options.popularity[0],
            maxPopularity: options.popularity[1],
            maxLocation: options.location,
            tags: tags,
            order: options.order,
            orderDirection: options.orderDirection
        };

        client.user.getMatch(reqOptions, (err, result) => {
            if (err) {
                console.error(err);
                return false;
            }
            client.emit('match.search.result', result);
        });
    };
    client.on('match.search', matchSearch);
};