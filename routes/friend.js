const Friend = require('../models/friend');
const Notification = require('../models/notification');
const UserProfile = require('../models/userProfile');

module.exports.index = (req, res) => {
    res.render('friends');
};

module.exports.socket = (io, client) => {
    const friendLike = (data) => {
        if (!data.target || !data.target.id)
            return false;

        Friend.getRequest(client.user.id, data.target.id, (err, like) => {
            if (err) {
                console.error(err);
                return false;
            }

            let notifications = [];

            let notif = new Notification();
            notif.emitter = client.user;
            notif.target = data.target;
            notif.type = 'FRIEND_REQUEST';

            notifications.push(notif);

            if (!like) {
                like = new Friend();
                like.user1 = client.user.id;
                like.user2 = data.target.id;
                like.userAction = data.target.id;
                like.status = 0;
            } else if (like.status === 0 && like.userAction === client.user.id) {
                like.userAction = null;
                like.status = 1;

                let notif1 = new Notification();
                notif1.emitter = client.user;
                notif1.target = data.target;
                notif1.type = 'FRIEND_ACCEPT';
                notifications.push(notif1);

                let notif2 = new Notification();
                notif2.emitter = data.target;
                notif2.target = client.user;
                notif2.type = 'FRIEND_ACCEPT';
                notifications.push(notif2);
            } else {
                return false;
            }

            like.save((err, result) => {
                if (err) {
                    console.log(err);
                    return false;
                }

                UserProfile.getProfile(data.target.id, (err, userProfile) => {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    if (!userProfile)
                        return false;

                    if (userProfile.popularity + 3 <= 100)
                        userProfile.popularity += 3; // 3 pts if someone like you
                    else
                        userProfile.popularity = 100;

                    userProfile.save((err) => {
                        if (err) {
                            console.error(err);
                            return false;
                        }

                        Notification.saveMultiples(notifications, (err) => {
                            if (err) {
                                console.log(err);
                            }

                            const room = 'user.' + data.target.id;
                            notifications.forEach((notif) => {
                                if (notif.target.id === client.user.id)
                                    client.emit('notification.received', notif);
                                else
                                    io.to(room).emit('notification.received', notif);

                            })
                        })
                    })
                });
            });
        });
    };
    client.on('friend.like', friendLike);

    const friendUnlike = (data) => {
        Friend.getRequest(client.user.id, data.target.id, (err, like) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (!like)
                return false;

            if (like.status === 0 && client.user.id !== like.userAction) {
                like.del((err) => {
                    if (err) {
                        console.error(err);
                        return false
                    }
                });
            } else {
                like.userAction = client.user.id;
                like.status = 0;
                like.save((err) => {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    let notif = new Notification();
                    notif.emitter = client.user;
                    notif.target = data.target;
                    notif.type = 'FRIEND_REMOVE';
                    notif.save((err) => {
                        if (err) {
                            console.error(err);
                            return false;
                        }

                        const room = 'user.' + data.target.id;
                        io.to(room).emit('notification.received', notif);
                    });
                })
            }
        })
    };
    client.on('friend.unlike', friendUnlike);

    const friendTest = (userId) => {
        Friend.getRequest(userId, client.user.id, (err, friend) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (friend)
                client.emit('friend.isfriend', friend);
        })
    };
    client.on('friend.test', friendTest);

    const friendBlock = (data) => {
        Friend.getRequest(client.user.id, data.target.id, (err, like) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (!like) {
                like = new Friend();
                like.user1 = client.user.id;
                like.user2 = data.target.id;
            }

            if (like.status === 2)
                return false;

            like.userAction = client.user.id;
            like.status = 2;

            like.save((err) => {
                if (err) {
                    console.error(err);
                    return false;
                }
            })
        });
    };
    client.on('friend.block', friendBlock);

    const friendUnblock = (data) => {
        Friend.getRequest(client.user.id, data.target.id, (err, friend) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (friend.status === 2 && friend.userAction === client.user.id) {
                friend.del((err) => {
                    if (err) {
                        console.error(err);
                        return false;
                    }
                })
            }
        })
    };
    client.on('friend.unblock', friendUnblock);
};