/* == TAGS == */
let autoData = {};
let defaultChips = [];
(() => {
    if (tags)
        tags.forEach((tag) => {
            autoData[tag.value] = null
        });

    if (userTags)
        userTags.forEach((tag) => {
            defaultChips.push({
                tag: tag.value,
                id: tag.id
            })
        });


    $(document).ready(function() {
        $('.chips').material_chip();
        $('.chips-autocomplete').material_chip({
            data: defaultChips,
            autocompleteOptions: {
                data: autoData,
                limit: Infinity,
                minLength: 1
            }
        });
    });

    /*$('.chips').on('chip.add', (e, chip) => {
        // Block add if tag do not exist
        let tag = tags.find((tag) => {
            return tag.value === chip.tag;
        });
        if (tag === undefined)
            return false;
    });*/
})();

/* == RANGE == */
let age = document.getElementById('ageRange');
let popularity = document.getElementById('popularityRange');
noUiSlider.create(age, {
    start: [18, 100],
    connect: true,
    step: 1,
    range: {
        'min': 18,
        'max': 100
    },
    tooltips: [
        wNumb({ decimals: 0 }),
        wNumb({ decimals: 0 })
    ],
    format: wNumb({
        decimals: 0,
    })
});
noUiSlider.create(popularity, {
    start: [0, 100],
    connect: true,
    step: 1,
    range: {
        'min': [0],
        'max': [100]
    },
    tooltips: [
        wNumb({ decimals: 0 }),
        wNumb({ decimals: 0 })
    ],
    format: wNumb({
        decimals: 0,
    })
});

/* == FORM SUBMIT == */

let localisationInput = $('select[name=localisation]');
let orderInput = $('select[name=order]');
let orderDirectionInput = $('select[name=orderDirection]');

$('#filterForm').submit((e) => {
    e.preventDefault();

    socket.emit('match.search', {
        age: age.noUiSlider.get(),
        popularity: popularity.noUiSlider.get(),
        location:  localisationInput.val(),
        order: orderInput.val(),
        orderDirection: orderDirectionInput.val(),
        tags: $('.chips').material_chip('data')
    });

    $('#profile').html('');
});

socket.on('match.search.result', (data) => {
    let template =
        `a(href="/profile/" + match.id).col.s12.m6.l4.xl3.white-text
            div.card.light-blue.lighten-2.my-card-image
                - var age = new Date().getFullYear() - new Date(match.profile.birthday).getFullYear();
                div.card-content(style="background-image: url(images_upload/" + match.profile.profileImage +");")
                div.card-action.row
                    div.col.s12 #{match.profile.firstname} #{match.profile.lastname}, #{age}yo`;

    $.each(data, (index, match) => {
        $('#profile').append(pug.render(template, {
            match: match
        }))
    });
});

