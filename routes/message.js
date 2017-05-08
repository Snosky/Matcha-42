const Friend = require('../models/friend');
const Message = require('../models/message');
const Promise = require('bluebird');

module.exports.index = (req, res) => {
    let unread = {};
    Friend.getFriends(req.user.id, (err, friends) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        Promise.each(friends, (friend) => {
            return new Promise((resolve, reject) => {
                Message.countUnread(friend.user1.id, req.user.id, (err, result) => {
                    if (err)
                        return reject(err);
                    unread[friend.user1.id] = result;
                    resolve();
                });
            });
        }).then(() => {
            res.render('messages', {
                friends: friends,
                unread: unread
            });
        }).catch((err) => {
            console.error(err);
            return res.status(500).send('Database error');
        });
    })
};

module.exports.socket = (io, client) => {

    const messageSend = (message) => {
        let msg = new Message();
        msg.emitter = client.user.id;
        msg.target = message.target;
        msg.message = message.message;

        msg.save((err) => {
            if (err) {
                console.error(err);
                return false;
            }

            const room = 'user.' + msg.target;
            io.to(room).emit('message.received', msg);
        });
    };
    client.on('message.send', messageSend);

    const messageHistory = (userId) => {
        Message.getAll(client.user.id, userId, (err, result) => {
            if (err) {
                console.error(err);
                return false
            }

            client.emit('message.history', {room: userId, messages: result});
        })
    };
    client.on('message.history', messageHistory);

    const messageRead = (userId) => {
        Message.setRead(userId, client.user.id, (err, totalRead) => {
            if (err)
                console.error(err);
            client.emit('message.read', totalRead)
        })
    };
    client.on('message.read', messageRead);

    const messageTotalUnread = () => {
        Message.countTotalUnread(client.user.id, (err, total) => {
            if (err) {
                console.error(err);
                return false
            }
            client.emit('message.totalUnread', total);
        })
    };
    client.on('message.totalUnread', messageTotalUnread);
};