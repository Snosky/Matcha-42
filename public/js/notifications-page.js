jQuery(document).ready(function() {
    jQuery("time.timeago").timeago();
});

let collection = $('ul.collection');
socket.on('notification.received', (notif) => {
    let notifHtml = undefined;
    switch (notif.type) {
        case 'PROFILE_VIEW':
            notifHtml = `<a href="/profile/${notif.emitter.id}" class="bold">${notif.emitter.profile.firstname} ${notif.emitter.profile.lastname}</a> has visited your profile.`;
    }

    if (notifHtml) {
        let date = jQuery.timeago(notif.time);

        notifHtml = `<li class="collection-item unread">${notifHtml} <time class="date timeago grey-text">${date}</time></li>`;
        collection.prepend(notifHtml);
    }
});