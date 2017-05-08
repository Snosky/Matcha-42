const Friend = require('../models/friend');
const Notification = require('../models/notification');
const User = require('../models/user');

module.exports.socket = (io, client) => {
    const friendRequest = (data) => {
        const room = 'user.' + data.target;

        Friend.getRequest(client.user.id, data.target, (err, result) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (result && result.userAction === client.user.id) { // Si true, accepte requete
                friendRequestAccept(data.target);
                return true;
            } else if (result) {
                return false;
            }

            let friend = new Friend();
            friend.user1 = client.user;
            friend.user2 = data.target;
            friend.userAction = data.target;
            friend.status = 0;
            friend.save((err, result) => {
                if (err) {
                    console.error(err);
                    return false;
                }

                if (io.sockets.adapter.rooms[room] === undefined)
                    return false;
                io.to(room).emit('friend.request.new', friend);
            });
        });
    };
    client.on('friend.request.send', friendRequest);

    const friendGetRequests = () => {
        Friend.getRequests(client.user.id, (err, result) => {
            if (err) {
                console.error(err);
                return false;
            }

            result.forEach((friend) => {
                client.emit('friend.request.new', friend)
            })
        })
    };
    client.on('friend.getRequests', friendGetRequests);

    const friendRequestAccept = (userId) => {
        Friend.getRequest(userId, client.user.id, (err, friend) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (!friend)
                return false;

            friend.status = 1;
            friend.save((err) => {
                if (err) {
                    console.error(err);
                    return false;
                }

                // Notification
                const room = 'user.' + userId;
                io.to(room).emit('friend.request.accept', client.user.id);
                let notif = new Notification();
                notif.emitter = client.user;
                notif.target = userId;
                notif.type = 'FRIEND_ACCEPT';
                notif.save((err) => {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    User.findById(userId, (err, user2) => {
                        if (err) {
                            console.error(err);
                            return false;
                        }

                        user2.getProfile((err) => {
                            if (err) {
                                console.error(err);
                                return false;
                            }

                            user2.profile.popularity += 5;
                            user2.saveProfile((err) => {
                                if (err) {
                                    console.error(err);
                                    return false;
                                }

                                client.user.profile.popularity += 5;
                                client.user.saveProfile((err) => {
                                    if (err) {
                                        console.error(err);
                                        return false;
                                    }
                                    io.to(room).emit('notification.received', notif);
                                });
                            })
                        })
                    });
                })

            })
        });
    };
    client.on('friend.request.accept', friendRequestAccept);

    const friendRequestIgnore = (userId) => {
        Friend.getRequest(userId, client.user.id, (err, friend) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (!friend)
                return false;

            friend.delete((err) => {
                if (err) {
                    console.error(err);
                    return false;
                }

                // Notification
                const room = 'user.' + userId;
                io.to(room).emit('friend.remove', client.user.id);
                let notif = new Notification();
                notif.emitter = client.user;
                notif.target = userId;
                notif.type = 'FRIEND_IGNORE';
                notif.save((err) => {
                    if (err) {
                        console.error(err);
                        return false;
                    }
                    io.to(room).emit('notification.received', notif);
                })
            })
        });
    };
    client.on('friend.request.ignore', friendRequestIgnore);

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

    const friendRemove = (userId) => {
        Friend.getRequest(userId, client.user.id, (err, friend) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (!friend)
                return false;

            friend.delete((err) => {
                if (err) {
                    console.error(err);
                    return false;
                }

                // Notification
                const room = 'user.' + userId;
                io.to(room).emit('friend.remove', client.user.id);
                if (friend.status) {
                    let notif = new Notification();
                    notif.emitter = client.user;
                    notif.target = userId;
                    notif.type = 'FRIEND_REMOVE';
                    notif.save((err) => {
                        if (err) {
                            console.error(err);
                            return false;
                        }
                        io.to(room).emit('notification.received', notif);
                    });
                }
            })
        })
    };
    client.on('friend.remove', friendRemove);

    const friendBlock = (userId) => {
        let friend = new Friend;
        friend.user1 = client.user.id;
        friend.user2 = userId;
        friend.userAction = client.user.id;
        friend.status = 2;

        friend.save((err) => {
            if (err)
                console.error(err);
        })
    };
    client.on('friend.block', friendBlock);

    const friendUnblock = (userId) => {
        Friend.getRequest(client.user.id, userId, (err, friend) => {
            if (err) {
                console.error(err);
                return false;
            }

            if (friend.status === 2 && friend.userAction === client.user.id) {
                friend.delete((err) => {
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