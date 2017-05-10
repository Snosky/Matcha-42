const Notification = require('../models/notification');
const User = require('../models/user');
const Friend = require('../models/friend');

module.exports.index = (req, res) => {
    Notification.getAllFromUser(req.user.id, (err, notifs) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        Notification.setReadForUser(req.user.id, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            res.render('notifications', {
                notifs: notifs
            });
        })
    });
};

module.exports.socket = (io, client) => {
    // Get unread notification
    const notificationUnread = () => {
        Notification.getUnread(client.user.id, (err, notifs) => {
            if (err) {
                console.error(err);
                return false
            }
            notifs.forEach((notif) => {
                client.emit('notification.received', notif);
            })
        });
    };
    client.on('notification.getUnread', notificationUnread);

    // New notification
    const notificationSend = (data) => {
        if (data.target === undefined)
            return false;
        const room = 'user.' + data.target;

        if (client.user.id === data.target)
            return false;

        Friend.getRequest(client.user.id, data.target, (err, friend) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (friend && friend.status ===2) // Si blocker pas de notif
                return false;

            let notif = new Notification();
            notif.emitter = client.user;
            notif.target = data.target;
            notif.type = data.type;
            notif.exist((err, count) => {
                if (err) {
                    console.error(err);
                    return false;
                }

                if (count === 0) { // Si pas deja entre, uniquement pour PROFILE_VIEW
                    notif.save((err, result) => {
                        if (err)
                            console.error(err);

                        io.to(room).emit('notification.received', notif);
                        if (notif.type === 'PROFILE_VIEW') {
                            User.findById(data.target, (err, user) => {
                                if (err) {
                                    console.error(err);
                                    return false
                                }

                                if (!user)
                                    return false;

                                user.getProfile((err) => {
                                    if (err) {
                                        console.error(err);
                                        return false;
                                    }

                                    if (user.profile.popularity + 1 <= 100)
                                        user.profile.popularity += 1;
                                    else
                                        user.profile.popularity = 100;
                                    user.saveProfile((err) => {
                                        if (err) {
                                            console.error(err);
                                            return false;
                                        }
                                        return true;
                                    })
                                });
                            });
                        }
                    });
                }
            });
        });
    };
    client.on('notification.send', notificationSend);

    // Set notifications as read
    const notificationRead = (data) => {
        data.forEach((notif) => {
            notif = Notification.fromJSON(notif);
            notif.status = 1;
            notif.save((err) => {
                if (err) {
                    console.error(err);
                }
            })
        })
    };
    client.on('notification.read', notificationRead);
};