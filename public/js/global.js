$(document).ready(function() {

    // Materialize initialisation
    $('select').material_select();

    $('.datepicker-birthday').pickadate({
        selectMonths: true,
        selectYears: 100,
        max: new Date(),
        formatSubmit: 'yyyy-mm-dd',
        hiddenName: true
    });
});