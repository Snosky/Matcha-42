$(document).ready(function() {

    // Materialize initialisation
    $('select').material_select();
    $('.tooltipped').tooltip({delay: 50});

    $('.datepicker-birthday').pickadate({
        selectMonths: true,
        selectYears: 100,
        max: new Date(),
        formatSubmit: 'yyyy-mm-dd',
        hiddenName: true
    });

    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: false,
        belowOrigin: true,
        alignment: 'right'
    });
});