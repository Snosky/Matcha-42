const pug = require('pug');
/* == DROPDOWN == */
$(document).ready(() => {
    $('.dropdown-button#user-title').dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: false,
        belowOrigin: true,
        alignment: 'right',
    });

    $('.dropdown-button#notifications-title, .dropdown-button#friends-title').dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: false,
        belowOrigin: true,
        alignment: 'left',
        constrainWidth: false
    });
});

/* == GEO == */
(() => {
    options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 86400000
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateGeo, error, options);
    } else {
        $.getJSON("http://freegeoip.net/json/", function(data) {
            updateGeo({
                coords: {
                    latitude: data.latitude,
                    longitude: data.longitude
                }
            });
        });
    }

    function updateGeo(position) {
        console.log('Update geo', position);
        socket.emit('geo.update', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        });
    }

    function error(err) {
        console.warn(err.message);
        $.getJSON("http://freegeoip.net/json/", function(data) {
            updateGeo({
                coords: {
                    latitude: data.latitude,
                    longitude: data.longitude
                }
            });
        });
    }
})();

/* == NOTIFICATIONS == */
const notifContainer = $('#notifications-dropdown');
const notifTitle = $('#notifications-title');
let unreadNotifications = [];

const addNotif = (notif) => {
    let notifHtml = undefined;
    switch (notif.type) {
        case 'PROFILE_VIEW':
            notifHtml =
                `a(href="/profile/#{notif.emitter.id}") #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  has visited your profile.`;
            break;

        case 'FRIEND_ACCEPT':
            notifHtml =
                `a(href="/profile/#{notif.emitter.id}") #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  accepted your friend request.`;
            break;

        case 'FRIEND_IGNORE':
            notifHtml =
                `a(href="/profile/#{notif.emitter.id}") #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  refused your friend request.`;
            break;

        case 'FRIEND_REMOVE':
            notifHtml =
                `a(href="/profile/#{notif.emitter.id}") #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  removed you from his friends list.`;
    }

    if (notifHtml) {

        let date = jQuery.timeago(notif.time);

        notifHtml =
            `li.notification
                ${notifHtml}
                span.date ${date}`;
        notifContainer.prepend(pug.render(notifHtml, {notif: notif}));

        if (unreadNotifications.length === 0) {
            $('li.nothing', notifContainer).hide();
            $('.material-icons', notifTitle).html('notifications_active');
            notifTitle.append('<span class="notifsCount"></span>');
        }
        unreadNotifications.push(notif);
        $('.notifsCount', notifTitle).html( unreadNotifications.length );
    }
};

// Get unread notification
socket.emit('notification.getUnread');

// New notification
socket.on('notification.received', (notif) => {
    addNotif(notif);
});

notifTitle.on('click', () => {
    if (unreadNotifications.length) {
        //$('li.nothing', notifContainer).show();
        $('.material-icons', notifTitle).html('notifications_none');
        $('.notifsCount', notifTitle).remove();
        socket.emit('notification.read', unreadNotifications);
        unreadNotifications = [];
    }
});

/* == FRIENDS == */
const friendContainer = $('#friends-dropdown');
const friendTitle = $('#friends-title');
let friendLen = 0;
const addFriendsRequest = (friend) => {
    let request =
        `li(request_id=friend.user1.id)
            a(href="/profile" + friend.user1.id) #{friend.user1.profile.firstname} #{friend.user1.profile.lastname}
            |  want to be your friend.
            p
                a(onclick="acceptFriend("+friend.user1.id+")").accept Accept
                a(onclick="ignoreFriend("+friend.user1.id+")").ignore Ignore`;

    friendContainer.prepend(pug.render(request, {
        friend: friend
    }));

    if (friendLen <= 0) {
        friendLen = 0;
        $('li.nothing', friendContainer).hide();
        $('.material-icons', friendTitle).html('people');
        friendTitle.append('<span class="notifsCount">0</span>');
    }
    friendLen++;
    $('.notifsCount', friendTitle).html(friendLen);
};

socket.emit('friend.getRequests');

socket.on('friend.request.new', (friend) => {
    addFriendsRequest(friend);
});

socket.on('friend.remove', (id) => {
    removeFriendFromList(id);
});

const acceptFriend = (request_id) => {
    removeFriendFromList(request_id);
    if (typeof acceptFromList !== 'undefined')
        acceptFromList(request_id);
    socket.emit('friend.request.accept', request_id);
};

const ignoreFriend = (request_id) => {
    removeFriendFromList(request_id);
    if (typeof ignoreFromList !== 'undefined')
        ignoreFromList(request_id);
    socket.emit('friend.request.ignore', request_id);
};

function removeFriendFromList(id) {
    $('li[request_id='+id+']').remove();
    friendLen--;
    if (friendLen === 0) {
        $('li.nothing', friendContainer).show();
        $('.material-icons', friendTitle).html('people_outline');
        $('.notifsCount', friendTitle).remove()
    } else {
        $('.notifsCount', friendTitle).html(friendLen);
    }
}

/* == MESSAGES == */
const messageTitle = $('#messages-title');
const notifAudio = new Audio('/sounds/notif.mp3');
let totalUnread = 0;

const updateUnreadCount = () => {
    if (totalUnread > 0) {
        $('.material-icons', messageTitle).html('chat_bubble');
        if ($('.notifsCount', messageTitle).length === 0)
            messageTitle.append('<span class="notifsCount"></span>');
        $('.notifsCount', messageTitle).html(totalUnread);
    } else {
        $('.material-icons', messageTitle).html('chat_bubble_outline');
        $('.notifsCount', messageTitle).remove();
    }
};

socket.on('message.received', (message) => {
    totalUnread++;
    updateUnreadCount();
    notifAudio.volume = 0.2;
    notifAudio.play();
});

socket.emit('message.totalUnread');
socket.on('message.totalUnread', (total) => {
    totalUnread = total;
    updateUnreadCount();
});

socket.on('message.read', (totalRead) => {
    totalUnread -= totalRead;
    updateUnreadCount();
});