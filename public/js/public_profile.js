/* TEMPLATES */
const defaultTemplate =
`a.btn.waves-effect.waves-light.pink#friend-request
    i.material-icons.left add
    | Like
a.btn.waves-effect.waves-light.red.darken-1#block
    i.material-icons.left block
    | Block`;

const pendingTemplate =
    `a.btn.waves-effect.waves-light.pink#remove
    i.material-icons.left add
    | Unlike`;

const isFriendTemplate =
`a.btn.waves-effect.waves-light.red#remove
    i.material-icons.left close
    | Unlike`;

const blockTemplate =
`a.btn.waves-effect.waves-light.red.darken-1#unblock
    i.material-icons.left block
    | Unblock user`;

const isBlockedTemplate = '';

const friendRequestTemplate =
`a.btn.waves-effect.waves-light.pink#friend-request
    i.material-icons.left add
    | Like
a.btn.waves-effect.waves-light.red.darken-1#block
    i.material-icons.left block
    | Block`;


/* END TEMPLATES */

$(document).ready(function(){
    $('time.timeago').timeago();

    let geocoder = new google.maps.Geocoder();
    let location = $('span#location');
    console.log(parseFloat(location.attr('lat')), location.attr('lat'));
    let latlng = new google.maps.LatLng(parseFloat(location.attr('lat')), parseFloat(location.attr('lng')));
    geocoder.geocode({'latLng': latlng}, function(result, status){
        if (status === google.maps.GeocoderStatus.OK) {
            if (result[1]) {
                location.html(result[0].formatted_address);
            }
        } else {
            console.warn(status);
            location.html('Unknown');
        }
    });
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
        $('#friendButton').html(pug.render(friendRequestTemplate));
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