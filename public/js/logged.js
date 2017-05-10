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

/* == NOTIFICATIONS == */
const notifContainer = $('#notifications-dropdown');
const notifTitle = $('#notifications-title');
const notifTitleMobile = $('li#notifications-title-mobile .badge');
let unreadNotifications = [];

const addNotif = (notif) => {
    let notifHtml = undefined;
    switch (notif.type) {
        case 'PROFILE_VIEW':
            notifHtml =
                `a(href="/profile/#{notif.emitter.id}") #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  has visited your profile.`;
            break;

        case 'FRIEND_REQUEST':
            notifHtml =
                `a(href="/profile/" + notif.emitter.id) #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  like you.`;
            break;

        case 'FRIEND_ACCEPT':
            notifHtml =
                `a(href="/profile/#{notif.emitter.id}") #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  and you are now connected.`;
            break;

        case 'FRIEND_REMOVE':
            notifHtml =
                `a(href="/profile/#{notif.emitter.id}") #{notif.emitter.profile.firstname} #{notif.emitter.profile.lastname}
                |  no more like you.`;
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

        // Add notif to mobile
        if (notifTitleMobile.hasClass('new') === false)
            notifTitleMobile.addClass('new');
        notifTitleMobile.html(unreadNotifications.length)
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
        $('.material-icons', notifTitle).html('notifications_none');
        $('.notifsCount', notifTitle).remove();
        socket.emit('notification.read', unreadNotifications);
        unreadNotifications = [];
    }
});

/* == MESSAGES == */
const messageTitle = $('#messages-title');
const notifAudio = new Audio('/sounds/notif.mp3');
const messageTitleMobile = $('#messages-title-mobile .badge');
let totalUnread = 0;

const updateUnreadCount = () => {
    if (totalUnread > 0) {
        $('.material-icons', messageTitle).html('chat_bubble');
        if ($('.notifsCount', messageTitle).length === 0)
            messageTitle.append('<span class="notifsCount"></span>');
        $('.notifsCount', messageTitle).html(totalUnread);

        if (messageTitleMobile.hasClass('new') === false)
            messageTitleMobile.addClass('new');
        messageTitleMobile.html(totalUnread);
    } else {
        $('.material-icons', messageTitle).html('chat_bubble_outline');
        $('.notifsCount', messageTitle).remove();
        messageTitleMobile.removeClass('new');
        messageTitleMobile.html('');
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