import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/collapse';
import Collapse from 'bootstrap/js/dist/collapse';

import $ from 'jquery';
import datepicker from 'js-datepicker'

var addTaskDueDateCollapsed = true;

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

    const myCollapsible = document.getElementById('collapseDueDate')
    myCollapsible.addEventListener('hidden.bs.collapse', event => {
        addTaskDueDateCollapsed = true
    })
    myCollapsible.addEventListener('shown.bs.collapse', event => {
        addTaskDueDateCollapsed = false
    })

    const addTaskModal = document.getElementById('addTaskModal');
    addTaskModal.addEventListener('hidden.bs.modal', event => {
        resetModal();
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
                // Adjust time to 24-hour format
                let hour24 = parseInt(hour);
                if (ampm === 'PM' && hour !== '12') {
                    hour24 += 12;
                } else if (ampm === 'AM' && hour === '12') {
                    hour24 = 0; // 12 AM should be 0 in 24-hour format
                }

                // Construct the due date string
                dueDate = date + 'T' + hour24.toString().padStart(2, '0') + ':' + min.padStart(2, '0') + ':00Z';         
            }
        }

        if(error) {
            return;
        }
    
        // Prepare data object for AJAX request
        var data = {
            task: taskDescription,
            completed: completed,
            priority: priority,
            due_date: dueDate
        };
    
        // Send AJAX POST request
        $.ajax({
            type: 'POST',
            url: '/todos',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                // Handle success response
                console.log('Task added successfully:', response.message);
                resetModal();
                addTodo(response.todo);
            },
            error: function(xhr, status, error) {
                // Handle error response
                console.error('Error adding task:', error);
            }
        });  
    });
});

function resetModal() {
    // Reset all input fields
    $('#addTaskDesc').val('');
    $('#addTaskDesc-error').addClass('d-none');
    $('#addTaskDesc').removeClass('is-invalid');

    $('#addTaskCompCheck').prop('checked', false);
    
    $('#addTaskPrioritySel').val('Select a Priority');
    $('#addTaskPrioritySel-error').addClass('d-none');
    $('#addTaskPrioritySel').removeClass('is-invalid');

    $('#addTaskDueDateSwitch').prop('checked', false);

    $('#addTaskDatePicker').val(''); // Reset datepicker input value
    $('#addTaskDatePicker-error').text('');
    $('#addTaskDatePicker').removeClass('is-invalid').addClass('mb-3');

    $('#addTaskHourSel').val('12'); // Reset hour input value to default
    $('#addTaskMinSel').val('0'); // Reset minute input value to default
    $('#addTaskAmPmSel').val('AM'); // Reset AM/PM input value to default

    // Get the Bootstrap Collapse instance associated with #collapseDueDate element
    var collapseInstance = Collapse.getInstance(document.getElementById('collapseDueDate'));

    if (collapseInstance) {
        // Check if the collapse element is currently shown
        if (!addTaskDueDateCollapsed) {
            // If it's not shown, toggle the collapse state
            collapseInstance.toggle();
        }
    }
};

function addTodo(todo) {
    // Get the table body element
    const tableBody = document.getElementById("tablebody");

    // Create a new table row
    const newRow = document.createElement("tr");

    var formattedDueDate = 'None'

    if (todo.due_date) {
        // Remove 'T' and 'Z' from the date string
        formattedDueDate = todo.due_date.replace('T', ' ').replace('Z', '');
    }
    
    // Populate the new row with todo data
    newRow.innerHTML = `
        <td>${todo.task}</td>
        <td>${todo.priority}</td>
        <td>${formattedDueDate}</td>
        <td>${todo.completed ? "Yes" : "No"}</td>
        <td>
            <!-- Add action buttons here -->
        </td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(newRow);
};
