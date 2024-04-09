import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/collapse';
import Collapse from 'bootstrap/js/dist/collapse';
import Modal from 'bootstrap/js/dist/modal';
import $ from 'jquery';
import datepicker from 'js-datepicker'

var taskDueDateCollapsed = true;
// Declare global variables
var modalInstance;
var collapseInstance;


// Initialize datepicker
$(function(){
    const today = new Date(); // Get today's date

    const picker = datepicker('#taskDatePicker', {
        formatter: (input, date, instance) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add padding if needed
            const day = date.getDate().toString().padStart(2, '0'); // Add padding if needed
            const value = `${year}-${month}-${day}`;
            input.value = value;
        },
        minDate: today // Set minimum date to today
    });

    modalInstance = Modal.getOrCreateInstance(document.getElementById('taskModal'));

    const myCollapsible = document.getElementById('collapseDueDate')
    myCollapsible.addEventListener('hidden.bs.collapse', event => {
        taskDueDateCollapsed = true
    })
    myCollapsible.addEventListener('shown.bs.collapse', event => {
        taskDueDateCollapsed = false
    })

    const taskModal = document.getElementById('taskModal');
    taskModal.addEventListener('hidden.bs.modal', event => {
        resetModal();
    });

    $('#taskBtn').on("click", function() {
        // Call the task function when the button is clicked
        addTask();
    });

    addTodoActionListeners();
});

function addTask(){
    // Call ValidateModal function
    var validationResult = ValidateModal();

    // Check the result
    if (typeof validationResult === 'string') {
        // If validationResult is a string, it means there's an error
        console.error(validationResult); // Output the error message
        return;
    } else {
        // If validationResult is not a string, it contains the data object
        var data = validationResult;
        // Proceed with your AJAX request or any other operation using the 'data' object
        console.log("Data object for AJAX request:", data);
    }

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
}

function ValidateModal(){
    var taskDescription = $('#taskDesc').val();
    var completed = $('#taskCompCheck').prop('checked');
    var priority = $('#taskPrioritySel').val();
    var dueDateSwitch = $('#taskDueDateSwitch').prop('checked');

    var error = false;
    // Check if task description and priority are selected
    if (taskDescription.trim() === '') {
        $('#taskDesc-error').text('This field is required').removeClass('d-none');
        $('#taskDesc').addClass('is-invalid');
        error = true;
    }else{
        $('#taskDesc-error').addClass('d-none');
        $('#taskDesc').removeClass('is-invalid');
    }
    if (priority === 'Select a Priority') {
        $('#taskPrioritySel-error').text('This field is required').removeClass('d-none');
        $('#taskPrioritySel').addClass('is-invalid');
        error = true;
    }else{
        $('#taskPrioritySel-error').addClass('d-none');
        $('#taskPrioritySel').removeClass('is-invalid');
    }

    var dueDate = ''; // Initialize due date string

    if(dueDateSwitch) {
        var date = $('#taskDatePicker').val(); // Retrieve datepicker input value
        var hour = $('#taskHourSel').val(); // Retrieve hour input value
        var min = $('#taskMinSel').val(); // Retrieve minute input value
        var ampm = $('#taskAmPmSel').val(); // Retrieve AM/PM input value

        // Check if datepicker input has a value
        if (!date) {
            $('#taskDatePicker').addClass('is-invalid').removeClass('mb-3');
            $('#taskDatePicker-error').text('This field is required')
            error = true;
        }
        else {
            $('#taskDatePicker-error').text('');
            $('#taskDatePicker').removeClass('is-invalid').addClass('mb-3');
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

    if (error) {
        return "Please fix the errors before proceeding.";
    } else {
        // Prepare data object for AJAX request
        var data = {
            task: taskDescription,
            completed: completed,
            priority: priority,
            due_date: dueDate
        };
        return data; // Return data object for AJAX request
    }
}

function resetModal() {
    $('#taskModalLabel').text('Add Task');
    $('#taskBtn').off("click").on("click", addTask);

    // Reset all input fields
    $('#taskDesc').val('');
    $('#taskDesc-error').addClass('d-none');
    $('#taskDesc').removeClass('is-invalid');

    $('#taskCompCheck').prop('checked', false);
    
    $('#taskPrioritySel').val('Select a Priority');
    $('#taskPrioritySel-error').addClass('d-none');
    $('#taskPrioritySel').removeClass('is-invalid');

    $('#taskBtn').text('Add Task');

    $('#taskDueDateSwitch').prop('checked', false);

    $('#taskDatePicker').val(''); // Reset datepicker input value
    $('#taskDatePicker-error').text('');
    $('#taskDatePicker').removeClass('is-invalid').addClass('mb-3');

    $('#taskHourSel').val('12'); // Reset hour input value to default
    $('#taskMinSel').val('00'); // Reset minute input value to default
    $('#taskAmPmSel').val('AM'); // Reset AM/PM input value to default

    collapseInstance = Collapse.getInstance(document.getElementById('collapseDueDate'));

    if (collapseInstance) {
        // Check if the collapse element is currently shown
        if (!taskDueDateCollapsed) {
            // If it's not shown, toggle the collapse state
            collapseInstance.toggle();
        }
    }
}

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

    var priorityClass = '';
    if (todo.priority === 'low') {
        priorityClass = 'table-primary';
    } else if (todo.priority === 'medium') {
        priorityClass = 'table-secondary';
    } else if (todo.priority === 'high') {
        priorityClass = 'table-danger';
    }
    
    // Populate the new row with todo data
    newRow.innerHTML = `
        <td>  
            <textarea class="form-control" id="taskTextArea${todo.id}" rows="3" maxlength="255" disabled>${todo.task}</textarea>
        </td>
        <td class="text-capitalize fw-semibold text-white ${priorityClass}">${todo.priority}</td>
        <td>${formattedDueDate}</td>
        <td>${todo.completed ? "Yes" : "No"}</td>
        <td>
        ${!todo.completed ? `
            <button class="btn btn-success btn-sm" data-todo-id="${todo.id}" id="completeTask${todo.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                </svg>
            </button>
            <button class="btn btn-primary btn-sm " data-todo-id="${todo.id}" id="editTask${todo.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                    <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                </svg>
            </button>
        ` : ''}
        <button class="btn btn-danger btn-sm" data-todo-id="${todo.id}" id="deleteTask${todo.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
        </button>
        </td>
    `;

    // Set the ID of the new row to 'row' + todo ID
    newRow.id = 'row' + todo.id;
    newRow.className = 'align-middle';

    // Append the new row to the table body
    tableBody.appendChild(newRow);

    addTodoActionListeners();
}

function deleteTodo(todoId) {
    // Send an AJAX request to delete the todo
    $.ajax({
        type: 'DELETE',
        url: '/todos/' + todoId,
        success: function(response) {
            // Handle success response
            console.log('Todo deleted successfully:', response.message);

            $('#row' + todoId).remove();
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error deleting todo:', error);
        }
    });
}

function markAsComplete(todoId) {
    // Send an AJAX request to update the todo as complete
    $.ajax({
        type: 'PUT',
        url: '/todos/' + todoId,
        contentType: 'application/json',
        data: JSON.stringify({ completed: true }), // Mark the todo as completed
        success: function(response) {
            // Handle success response
            console.log('Todo marked as complete:', response.message);
            // Update the row to reflect the completed status
            $('#row' + todoId + ' td:nth-child(4)').text('Yes'); // Update status column to "Yes"
            // Remove the "Mark as Complete" and "Edit" buttons
            $('#completeTask' + todoId).remove();
            $('#editTask' + todoId).remove();
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error marking todo as complete:', error);
        }
    });
}

function editTodo(todoId) {
    // Find the row corresponding to the todoId
    var row = $('#row' + todoId);

    // Extract task data from the row
    var taskDescription = row.find('td:nth-child(1)').text().trim();
    var priority = row.find('td:nth-child(2)').text().trim();
    var dueDate = row.find('td:nth-child(3)').text().trim();
    var completed = row.find('td:nth-child(4)').text().trim() === "Yes";

    // Update modal title to "Edit Task"
    $('#taskModalLabel').text('Edit Task');

    // Populate modal fields with existing task data
    $('#taskDesc').val(taskDescription);
    $('#taskCompCheck').prop('checked', completed);
    $('#taskPrioritySel').val(priority);
    $('#taskBtn').text('Save Task');

    // Set due date switch based on the presence of due date
    var dueDateSwitch = dueDate !== 'None';
    $('#taskDueDateSwitch').prop('checked', dueDateSwitch);

    if (dueDateSwitch) {
        // Split the dueDate string into date and time components
        var dueDateParts = dueDate.split(' ');
        var date = dueDateParts[0]; // Extract date part

        var time = ''; // Initialize time variable

        // If dueDateParts has a second element (i.e., time part is present)
        if (dueDateParts.length > 1) {
            time = dueDateParts[1]; // Extract time part
        }

        // If time is not empty, extract hour and minute
        var hour = '';
        var min = '';
        if (time !== '') {
            hour = time.split(':')[0]; // Extract hour from time
            min = time.split(':')[1]; // Extract minute from time
        }

        // Determine AM/PM based on hour
        var ampm = hour >= 12 ? 'PM' : 'AM';

        // Adjust hour to 12-hour format
        hour = hour % 12 || 12;

        $('#taskDatePicker').val(date); // Set date input value
        $('#taskHourSel').val(hour); // Set hour input value
        $('#taskMinSel').val(min); // Set minute input value
        $('#taskAmPmSel').val(ampm); // Set AM/PM input value

        collapseInstance = Collapse.getOrCreateInstance(document.getElementById('collapseDueDate'));

        if (collapseInstance) {
            // Check if the collapse element is currently shown
            if (taskDueDateCollapsed) {
                // If it's not shown, toggle the collapse state
                collapseInstance.toggle();
            }
        }
    }
    $('#taskBtn').off("click").on("click", function() {
        sendEditRequest(todoId); // Call sendEditRequest function with parameters
    });
    modalInstance.show();
}

function sendEditRequest(todoId){
    // Call ValidateModal function
    var validationResult = ValidateModal();

    // Check the result
    if (typeof validationResult === 'string') {
        // If validationResult is a string, it means there's an error
        console.error(validationResult); // Output the error message
        return;
    } else {
        // If validationResult is not a string, it contains the data object
        var data = validationResult;
        // Proceed with your AJAX request or any other operation using the 'data' object
        console.log("Data object for AJAX request:", data);
    }

    // AJAX request
    $.ajax({
        url: '/todos/' + todoId,
        type: 'PUT', // Use PUT method
        contentType: 'application/json', 
        data: JSON.stringify(data), // Convert data to JSON string
        dataType: 'json', 
        success: function(response) {
            // Handle success response
            console.log('Success:', response);
            // Find the row corresponding to the todoId
            var row = $('#row' + todoId);

            // Update the row with the extracted data
            $('#taskTextArea' + todoId).val(data.task);

            var priorityClass = '';
            if (data.priority === 'low') {
                priorityClass = 'table-primary';
            } else if (data.priority === 'medium') {
                priorityClass = 'table-secondary';
            } else if (data.priority === 'high') {
                priorityClass = 'table-danger';
            }

            row.find('td:nth-child(2)').removeClass(function(index, className) {
                // Split the classNames by space
                var classNames = className.split(' ');
                // Filter out classNames that start with "table-"
                var filteredClassNames = classNames.filter(function(name) {
                    return name.startsWith('table-');
                });
                // Return the filtered class names joined by space
                return filteredClassNames.join(' ');
            }).addClass(priorityClass);

            row.find('td:nth-child(2)').text(data.priority);
            row.find('td:nth-child(2)').addClass(priorityClass);

            // Check if due date is empty
            if (data.due_date === "") {
                row.find('td:nth-child(3)').text("None");
            } else {
                var formattedDueDate = data.due_date.replace('T', ' ').replace('Z', '');
                row.find('td:nth-child(3)').text(formattedDueDate);
            }

            // Set completion status
            row.find('td:nth-child(4)').text(data.completed ? "Yes" : "No");

            modalInstance.hide();
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error:', error);
        }
    });
}

function addTodoActionListeners() {
    // jQuery code to handle click event on delete button
    $("[id^='deleteTask']").on('click', function() {
        // Get the todo ID from the data-todo-id attribute
        var todoId = $(this).data('todo-id');
        // Call the deleteTodo function passing the todo ID
        deleteTodo(todoId);
    });

    // jQuery code to handle click event on edit button
    $("[id^='editTask']").on('click', function() {
        // Get the todo ID from the data-todo-id attribute
        var todoId = $(this).data('todo-id');
        // Call the editTodo function passing the todo ID
        editTodo(todoId);
    });

    // jQuery code to handle click event on markascomplete button
    $("[id^='completeTask']").on('click', function() {
        // Get the todo ID from the data-todo-id attribute
        var todoId = $(this).data('todo-id');
        // Call the markAsComplete function passing the todo ID
        markAsComplete(todoId);
    });
}
