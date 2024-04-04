import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/collapse';
import $ from 'jquery';
import datepicker from 'js-datepicker'

// Initialize datepicker
$(function(){
    const today = new Date(); // Get today's date

    const picker = datepicker('#addTaskDatePicker', {
        formatter: (input, date, instance) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add padding if needed
            const day = date.getDate().toString().padStart(2, '0'); // Add padding if needed
            const value = `${year}-${month}-${day}`;
            input.value = value;
        },
        minDate: today // Set minimum date to today
    });

    $(document).on('click', '#addTaskBtn', function() {
        var taskDescription = $('#addTaskDesc').val();
        var completed = $('#addTaskCompCheck').prop('checked');
        var priority = $('#addTaskPrioritySel').val();
        var dueDateSwitch = $('#addTaskDueDateSwitch').prop('checked');

        var error = false;
        // Check if task description and priority are selected
        if (taskDescription.trim() === '') {
            $('#addTaskDesc-error').text('This field is required').removeClass('d-none');
            $('#addTaskDesc').addClass('is-invalid');
            error = true;
        }else{
            $('#addTaskDesc-error').addClass('d-none');
            $('#addTaskDesc').removeClass('is-invalid');
        }
        if (priority === 'Select a Priority') {
            $('#addTaskPrioritySel-error').text('This field is required').removeClass('d-none');
            $('#addTaskPrioritySel').addClass('is-invalid');
            error = true;
        }else{
            $('#addTaskPrioritySel-error').addClass('d-none');
            $('#addTaskPrioritySel').removeClass('is-invalid');
        }

        var dueDate = ''; // Initialize due date string

        if(dueDateSwitch) {
            var date = $('#addTaskDatePicker').val(); // Retrieve datepicker input value
            var hour = $('#addTaskHourSel').val(); // Retrieve hour input value
            var min = $('#addTaskMinSel').val(); // Retrieve minute input value
            var ampm = $('#addTaskAmPmSel').val(); // Retrieve AM/PM input value
    
            // Check if datepicker input has a value
            if (!date) {
                $('#addTaskDatePicker').addClass('is-invalid').removeClass('mb-3');
                $('#addTaskDatePicker-error').text('This field is required')
                error = true;
            }
            else {
                $('#addTaskDatePicker-error').text('');
                $('#addTaskDatePicker').removeClass('is-invalid').addClass('mb-3');
                // Construct due date string in the format "YYYY-MM-DDTHH:MM:SSZ"
                dueDate = date + 'T' + ((ampm === 'PM' && parseInt(hour) !== 12) ? (parseInt(hour) + 12) : hour) + ':' + min.padStart(2, '0') + ':00Z';
            }
        }

        if(error) {
            return;
        }
    
        // Prepare data object for AJAX request
        var data = {
            task: taskDescription,
            completed: completed,
            priority: priority
        };
    
        // Include due date in data object if it's not an empty string
        if (dueDate !== '') {
            data.due_date = dueDate;
        }
    
        // Send AJAX POST request
        $.ajax({
            type: 'POST',
            url: '/todos',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                // Handle success response
                console.log('Task added successfully:', response);
            },
            error: function(xhr, status, error) {
                // Handle error response
                console.error('Error adding task:', error);
            }
        });  
    });
});