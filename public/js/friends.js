socket.on('friend.request.new', (friend) => {
    let request =
        `li.collection-item(request_id=friend.user1.id)
            a(href="/profile/" + friend.user1.id) #{friend.user1.profile.firstname} #{friend.user1.profile.lastname}
            |  want to be your friend.
            p
                a(onclick="acceptFriend("+friend.user1.id+")").accept.btn.btn-waves.green Accept
                a(onclick="ignoreFriend("+friend.user1.id+")").ignore.btn.btn-waves.red Ignore`;

    $('ul.collection').prepend(pug.render(request, {
        friend: friend
    }));
});