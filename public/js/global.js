let pickers = {
    birthday: {
        selectMonths: true,
        selectYears: 100,
        max: new Date(),
        formatSubmit: 'yyyy-mm-dd',
        hiddenName: true
    }
};

$(document).ready(function() {
    // Materialize initialisation
    $('select').material_select();
    $(".button-collapse").sideNav();
    $('.tooltipped').tooltip({delay: 50});

    $('.datepicker-birthday').pickadate(pickers.birthday);
});