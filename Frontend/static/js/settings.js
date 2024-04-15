$(document).ready(function() {
    $('#update-btn').click(function() {
        var data = {};
        data.username = $('#username').val();
        data.email = $('#email').val();
        var password = $('#password').val();
        var repassword = $('#repassword').val();

        // Check if the passwords match
        if (password.trim() !== '' && password !== repassword) {
            $('#repassword-error').text('Passwords do not match');
            return;
        }

        // Only include password in data if it's not empty and matches the confirmation
        if (password.trim() !== '') {
            data.password = password;
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
                alert('Error updating user: ' + error);
            }
        });
    });
});
