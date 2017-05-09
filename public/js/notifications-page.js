jQuery(document).ready(function() {
    jQuery("time.timeago").timeago();
});

let collection = $('ul.collection');
socket.on('notification.received', (notif) => {
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
        collection.prepend(pug.render(notifHtml, {notif: notif}));
    }
});