import $ from 'jquery';

$(document).on("click", "#login-btn", function() {
    var email = $('#email').val();
    var password = $('#password').val();
    // Flag to track errors
    var missingValues = false;

    // Validation
    if (!email) {
        $('#email-error').text('This field is required.').removeClass('d-none');
        $('#email').addClass('is-invalid');
        missingValues = true;
    } else {
        $('#email-error').addClass('d-none');
        $('#email').removeClass('is-invalid');
    }

    if (!password) {
        $('#password-error').text('This field is required.').removeClass('d-none');
        $('#password').addClass('is-invalid');
        missingValues = true;
    } else {
        $('#password-error').addClass('d-none');
        $('#password').removeClass('is-invalid');
    }

    // If there are missing values, stop processing
    if (missingValues) {
        return;
    }

    // Make POST request
    $.ajax({
    type: 'POST',
    url: '/auth/login',
    contentType: 'application/json',
    data: JSON.stringify({email: email, password: password}),
    success: function(response) {
        if (response.hasOwnProperty('message')) {
            // User created successfully
            window.location.href = '/todo-list'; // Redirect to success page
        }
    },
    error: function(xhr, status, error) {
        var response = xhr.responseJSON;
        if (response.hasOwnProperty('error')) {
            // Display general error message
            console.log(response.error);
            
            // Display field-specific error message
            if (response.hasOwnProperty('field')) {
                var field = response.field;
                $('#' + field + '-error').text(response.error).removeClass('d-none');
                $('#' + field).addClass('is-invalid');
            }
        }        
    }
    });
});