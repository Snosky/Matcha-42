const userRoute = require('./user');
const matchRoute = require('./match');
const notificateionRoute = require('./notification');
const friendRoute = require('./friend');
const messageRoute = require('./message');

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
        client.user.password = undefined;
        client.user.token = undefined;

        client.user.getProfile((err) => {
            if (err) {
                console.error(err);
                return false;
            }

            client.join('user.' + client.user.id);

            userRoute.socket(io, client);
            matchRoute.socket(io, client);
            notificateionRoute.socket(io, client);
            friendRoute.socket(io, client);
            messageRoute.socket(io, client);

            client.on('user.isonline', (id) => {
                if (io.sockets.adapter.rooms['user.' + id])
                    client.emit('user.isonline', id);
            });

            client.on('disconnect', () => {
                client.user.profile.lastConnection = new Date();
                client.user.saveProfile((err) => {
                    if (err)
                        console.error(err)
                })
            })
        });

    });
};