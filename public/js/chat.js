let rooms = {}; // Save all actual chats rooms/messages permet de switch d'une room a l'autre sans recharger les messages
let actualRoom = undefined;

let chat = $('#chat');
let waiting = $('#waiting');
let chatBox = $('#chatBox');
let chatBoxContainer = $('#chatBoxContent', chatBox);
let chatMessage = $('textarea[name=message]');

let loader =
`div.preloader-wrapper.big.active
    div.spinner-layer.spinner-blue
        div.circle-clipper.left
            div.circle
        div.gap-patch
            div.circle
        div.circle-clipper.right
            div.circle`;

setInterval(function(){
    $('time.timeago').timeago();
}, 30000);

chat.hide();

/* Select a chat room */
$('#rooms').on('click', 'li.collection-item', function() {
    $('li.active').removeClass('active');
    $(this).addClass('active');
    changeRoom($(this).attr('chat_id'));
});

/* Switch room chat */
const changeRoom = (room_id) => {
    if (room_id === actualRoom)
        return false;

    actualRoom = room_id;
    $('li[chat_id=' + room_id + '] .badge').removeClass('new').html('');
    if (rooms[room_id] === undefined) {
        rooms[room_id] = {
            messages: [],
            history: false,
        };
    }

    if (rooms[room_id].history === false) {
        chatBoxContainer.html(pug.render(loader));
        socket.emit('message.history', room_id);
    }

    waiting.hide();
    chat.show();

    rooms[room_id].messages.forEach((message) => {
        addMessageToBox(message);
    });
    socket.emit('message.read', room_id);
};

socket.on('message.history', (history) => {
    chatBoxContainer.html('');
    rooms[history.room].history = true;
    history.messages.forEach((message) => {
        rooms[history.room].messages.push(message);
        if (history.room == actualRoom) {
            message.type = (message.target === user.id) ? 'received' : 'send';
            addMessageToBox(message);
        }
    });

});

/* Send a message */
$('#form form').submit(function(e) {
    e.preventDefault();
    sendMessage();
});

chatMessage.keypress(function(e) {
    if (e.which === 13 && !e.shiftKey) {
        sendMessage();
        e.preventDefault();
    }
});

const sendMessage = () => {
    if (chatMessage.val().length > 10000) {
        alert('Message too long. Max 10000 char.');
        return false;
    }

    let message = {
        type: 'send',
        message: chatMessage.val(),
        date: new Date(),
        target: actualRoom
    };
    chatMessage.val('');
    addMessageToBox(message);
    socket.emit('message.send', message);
};

const addMessageToBox = (message) => {
    let template = undefined;
    if (message.type === 'send') {
        template =
            `div.col.s12.m6.offset-m6.right-align
                div.message.light-blue.lighten-1.white-text.z-depth-1.message-right= message`;
    } else if (message.type === 'received') {
        template =
            `div.col.s12.m6
                div.message.grey.lighten-4.z-depth-1= message`;
    }
    template =
        `div.row
            ${template}
                    time.row.timeago(datetime=time)`;
    $('div#chatBoxContent', chatBox).append(pug.render(template, {message: message.message, time: message.date}));
    chatBox.scrollTop($('div#chatBoxContent').height());
    //chatBox.animate({ scrollTop:  }, "fast");
    $('time.timeago').timeago();
};

/* RECEIVED A MESSAGE */
socket.on('message.received', (message) => {
    message.type = 'received';

    if (rooms[message.emitter] === undefined) {
        rooms[message.emitter] = {
            messages: [],
            history: false,
        }
    }

    rooms[message.emitter].messages.push(message);
    if (message.emitter == actualRoom) {
        addMessageToBox(message);
        console.log(message);
        socket.emit('message.read', message.emitter);
    } else {
        $('li[chat_id=' + message.emitter + '] .badge').addClass('new').html(
            (parseInt($('li[chat_id=' + message.emitter + '] .badge').html()) || 0) + 1
        );
    }
});