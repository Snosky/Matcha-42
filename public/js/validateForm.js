function validateForm(values, errors) {

    let input = undefined;

    // Assign values
    $.each(values, (name, value) => {
        input = $(`[name=${name}]`);
        if (input && input.attr('type') !== 'password')
            input.val(value);
    });

    // Show errors
    $.each(errors, (name, messages) => {
        input = $(`[name=${name}]`);
        if (input) {
            input.addClass('invalid');
            let parent = input.closest('.input-field');
            let error = '<p class="input-error">' + messages.join('</p><p class="input-error">') + '</p>';
            $(error).appendTo(parent);
        }
    });

}