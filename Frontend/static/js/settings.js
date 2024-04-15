import $ from 'jquery';

$(document).on("click", "#update-btn", function() {
    var data = {};
    var username = $('#username').val();
    var email = $('#email').val();
    var password = $('#password').val();
    var repassword = $('#repassword').val();

    // Flag to track errors
    var missingValues = false;

    // Validation
    if (!username) {
        $('#username-error').text('This field is required.').removeClass('d-none');
        $('#username').addClass('is-invalid');
        missingValues = true;
    } else if (username.length > 50) {
        $('#username-error').text('Username must be maximum 50 characters.').removeClass('d-none');
        $('#username').addClass('is-invalid');
        missingValues = true;
    } else {
        $('#username-error').addClass('d-none');
        $('#username').removeClass('is-invalid');
    }

    if (!email) {
        $('#email-error').text('This field is required.').removeClass('d-none');
        $('#email').addClass('is-invalid');
        missingValues = true;
    } else if (email.length > 100) {
        $('#email-error').text('Email must be maximum 100 characters.').removeClass('d-none');
        $('#email').addClass('is-invalid');
        missingValues = true;
    } else {
        $('#email-error').addClass('d-none');
        $('#email').removeClass('is-invalid');
    }

    // If there are missing values, stop processing
    if (missingValues) {
        return;
    }

    // Check if password matches re-entered password
    if (password !== repassword) {
        $('#repassword-error').text('Passwords do not match. Please re-enter passwords.').removeClass('d-none');
        $('#repassword').addClass('is-invalid');
        return;
    }

    if (email !== "") {
        data.email = email;
    }
    if (username !== "") {
        data.username = username;
    }
    if (password !== "") {
        if (password.length > 20) {
            $('#password-error').text('Password must be maximum 20 characters.').removeClass('d-none');
            $('#password').addClass('is-invalid');
            missingValues = true;
            return;
        } else {
            $('#password-error').addClass('d-none');
            $('#password').removeClass('is-invalid');
            data.password = password;
        }
    }    

    // Make PUT request with JSON data
    $.ajax({
        type: 'PUT',
        url: '/auth/update',
        data: JSON.stringify(data), // Convert data to JSON string
        contentType: 'application/json', // Specify content type as JSON
        success: function(response) {
            alert('User updated successfully!');
            window.location.href = '/todo-list'; // Redirect to dashboard
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
