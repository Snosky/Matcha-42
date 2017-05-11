/* TEMPLATES */
const defaultTemplate =
`a.btn.waves-effect.waves-light.pink#like
    i.material-icons.left add
    | Like
a.btn.waves-effect.waves-light.red.darken-1#block
    i.material-icons.left block
    | Block`;

const isMatch =
`a.waves-effect.waves-teal.btn-flat It's a match
a.btn.waves-effect.waves-light.red#unlike
    i.material-icons.left close
    | Unlike`;

const isLike =
`a.btn.waves-effect.waves-light.red#unlike
    i.material-icons.left close
    | Unlike`;

const unblockTemplate =
`a.btn.waves-effect.waves-light.red.darken-1#unblock
    i.material-icons.left block
    | Unblock user`;

const blockTemplate = ``;

/* END TEMPLATES */

$('#friendButton')
    .on('click', '#like', function() { // Like
        $('#friendButton').html(pug.render(isLike));
        socket.emit('friend.like', {
            target: profileUser
        })
    })
    .on('click', '#unlike', function() { // Unlike
        $('#friendButton').html(pug.render(defaultTemplate));
        socket.emit('friend.unlike', {target: profileUser });
    })
    .on('click', '#block', function() { // Block user
        $('#friendButton').html(pug.render(unblockTemplate));
        socket.emit('friend.block', { target: profileUser });
    })
    .on('click', '#unblock', function() {
        $('#friendButton').html(pug.render(defaultTemplate));
        socket.emit('friend.unblock', { target: profileUser });
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
        button = isMatch;
    if (friend.status === 0 && friend.userAction !== user.id)
        button = isLike;
    else if (friend.status === 2 && friend.userAction === user.id)
        button = unblockTemplate;
    else if (friend.status === 2)
        button = blockTemplate;
    $('#friendButton').html(pug.render(button));
});

socket.on('notification.received', (notif) => {
    if (notif.type === 'FRIEND_ACCEPT')
        $('#friendButton').html(pug.render(isMatch));
});

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