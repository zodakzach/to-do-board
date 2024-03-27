import $ from 'jquery';

$(document).on("click", "#register-btn", function() {
    var username = $('#username').val();
    var email = $('#email').val();
    var password = $('#password').val();
    var repassword = $('#repassword').val();

    // Flag to track errors
    var missingValues = false;

    // Validation
    if (!username) {
        $('#username-error').text('This field is required.').removeClass('d-none');
        missingValues = true;
    } else if (username.length > 50) {
        $('#username-error').text('Username must be maximum 50 characters.').removeClass('d-none');
        missingValues = true;
    } else {
        $('#username-error').addClass('d-none');
    }

    if (!email) {
        $('#email-error').text('This field is required.').removeClass('d-none');
        missingValues = true;
    } else if (email.length > 100) {
        $('#email-error').text('Email must be maximum 100 characters.').removeClass('d-none');
        missingValues = true;
    } else {
        $('#email-error').addClass('d-none');
    }

    if (!password) {
        $('#password-error').text('This field is required.').removeClass('d-none');
        missingValues = true;
    } else if (password.length > 20) {
        $('#password-error').text('Password must be maximum 20 characters.').removeClass('d-none');
        missingValues = true;
    } else {
        $('#password-error').addClass('d-none');
    }

    if (!repassword) {
        $('#repassword-error').text('This field is required.').removeClass('d-none');
        missingValues = true;
    } else {
        $('#repassword-error').addClass('d-none');
    }

    // If there are missing values, stop processing
    if (missingValues) {
        return;
    }

    // Check if password matches re-entered password
    if (password !== repassword) {
        $('#repassword-error').text('Passwords do not match. Please re-enter passwords.').removeClass('d-none');
        return;
    }

    // Make POST request
    $.ajax({
        type: 'POST',
        url: '/register',
        contentType: 'application/json',
        data: JSON.stringify({username: username, email: email, password: password}),
        success: function(response) {
            if (response.hasOwnProperty('message')) {
                // User created successfully
                window.location.href = '/'; // Redirect to success page
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
                }
            }        }
    });
});
