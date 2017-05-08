/* TEMPLATES */
const defaultTemplate =
`a.btn.waves-effect.waves-light.pink#friend-request
    i.material-icons.left add
    | Send a friend request
a.btn.waves-effect.waves-light.red.darken-1#block
    i.material-icons.left block
    | Block user`;

const pendingTemplate =
`a.waves-effect.waves-teal.btn-flat Friend request pending.
a.btn.waves-effect.waves-light.red#remove
    i.material-icons.left close
    | Cancel friend request`;

const isFriendTemplate =
`a.btn.waves-effect.waves-light.blue
    i.material-icons.left message
    | Send a message
a.btn.waves-effect.waves-light.red#remove
    i.material-icons.left close
    | Remove friend`;

const blockTemplate =
`a.btn.waves-effect.waves-light.red.darken-1#unblock
    i.material-icons.left block
    | Unblock user`;

const isBlockedTemplate = '';


/* END TEMPLATES */

$(document).ready(function(){
    $('time.timeago').timeago();
});

$('#friendButton').on('click', '#friend-request', () => {
    $('#friendButton').html(pug.render(pendingTemplate));
    socket.emit('friend.request.send', {
        target: profileUser.id
    });
});

$('#friendButton').on('click', '#accept', (e) => {
    removeFriendFromList(profileUser.id);
    $('#friendButton').html(pug.render(isFriendTemplate));
    socket.emit('friend.request.accept', profileUser.id);
});

$('#friendButton').on('click', '#ignore', (e) => {
    removeFriendFromList(profileUser.id);
    $('#friendButton').html(pug.render(defaultTemplate));
    socket.emit('friend.request.ignore', profileUser.id);
});

$('#friendButton').on('click', '#remove', (e) => {
    $('#friendButton').html(pug.render(defaultTemplate));
    socket.emit('friend.remove', profileUser.id);
});

$('#friendButton').on('click', '#block', (e) => {
    $('#friendButton').html(pug.render(blockTemplate));
    socket.emit('friend.block', profileUser.id);
});

$('#friendButton').on('click', '#unblock', (e) => {
    $('#friendButton').html(pug.render(defaultTemplate));
    socket.emit('friend.unblock', profileUser.id);
});

socket.emit('notification.send', {
    target: profileUser.id,
    type: 'PROFILE_VIEW'
});

socket.emit('user.isonline', profileUser.id);
socket.on('user.isonline', (id) => {
    if (profileUser.id === id)
        $('time.timeago').html('Online');
});

socket.emit('friend.test', profileUser.id);
socket.on('friend.isfriend', (friend) => {
    let button = undefined;
    if (friend.status === 1)
        button = isFriendTemplate;
    else if (friend.status === 2 && friend.userAction === user.id)
        button = blockTemplate;
    else if (friend.status === 2)
        button = isBlockedTemplate;
    else if (friend.status === 0)
        button = pendingTemplate;
    $('#friendButton').html(pug.render(button));
});

socket.on('friend.request.new', (friend) => {
    if (friend.user1.id === profileUser.id) {
        let buttons =
`a.btn.waves-effect.waves-light.green#accept
    i.material-icons.left check
    | Accept friend request
a.btn.waves-effect.waves-light.red#ignore
    i.material-icons.left close
    | Ignore friend request`;
        $('#friendButton').html(pug.render(buttons));
    }
});

socket.on('friend.remove', (id) => {
    if (id === profileUser.id) {
        $('#friendButton').html(pug.render(defaultTemplate));
    }
});

socket.on('friend.request.accept', (id) => {
    if (id === profileUser.id) {
        $('#friendButton').html(pug.render(isFriendTemplate));
    }
});

function acceptFromList(id) {
    if (id === profileUser.id) {
        $('#friendButton').html(pug.render(isFriendTemplate));
    }
}

function ignoreFromList(id) {
    $('#friendButton').html(pug.render(defaultTemplate));
}