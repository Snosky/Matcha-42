let autoData = {};
let userTagsChip = [];
if (tags)
    tags.forEach((tag) => {
        autoData[tag.value] = null
    });

if (userTags)
    userTags.forEach((tag) => {
        userTagsChip.push({
            tag: tag.value,
            id: tag.id
        })
    });


$(document).ready(function() {
    $('.chips').material_chip();
    $('.chips-autocomplete').material_chip({
        data: userTagsChip,
        autocompleteOptions: {
            data: autoData,
            limit: Infinity,
            minLength: 1
        }
    });
});

$('.chips').on('chip.add', (e, chip) => {
    let tag = tags.find((tag) => {
        return tag.value === chip.tag;
    });

    socket.emit('tag.add', tag || { value: chip.tag });
    socket.on('tag.getId', tagGetId(chip));
});

$('.chips').on('chip.delete', (e, chip) => {
    socket.emit('tag.remove', chip);
});

const tagGetId = (chip) => {
    return (id) => {
        chip.id = id;
    };
};