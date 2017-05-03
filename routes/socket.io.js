const userRoute = require('./user');
const User = require('../models/user');

module.exports = (server, sessionMiddleware) => {
    const io = require('socket.io')(server);

    // Set session middleware
    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    io.sockets.on('connection', (client) => {
        if (client.request.session.user === undefined)
            return false;

        client.user = User.fromJSON(client.request.session.user);
        client.user.getMetas((err, result) => {
            if (err) {
                console.error(err);
                return false;
            }

            userRoute.socket(io, client);
        })

    });
};