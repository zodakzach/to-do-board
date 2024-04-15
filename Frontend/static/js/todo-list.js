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
var searchBar = document.getElementById('search');


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



    if (searchBar){
        // Event listener for the search bar
        searchBar.addEventListener('keyup', function() {
            // Get the search query entered by the user
            var searchString = searchBar.value.trim().toLowerCase();
        
            var filteredTodos;
        
            getAllUserTodos()
                .done(function(response) {
                    // Filter user todos based on the search query
                    filteredTodos = filterUserTodos(response, searchString);
                    clearTasks();
        
                    if (filterUserTodos.length > 0){
                        filteredTodos.forEach(function(task) {
                            addTodo(task);
                        });
                    }
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.error('Error:', textStatus, errorThrown);
                });
        
        });
    }
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
    var status = $('#taskStatusSel').val();
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
            status: status,
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

    $('#taskStatusSel').val('Not Started');
    
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
        var dateComponents = todo.due_date.split(/[-T:Z]/);
        var year = parseInt(dateComponents[0]);
        var month = parseInt(dateComponents[1]) - 1; // Month is 0-indexed
        var day = parseInt(dateComponents[2]);
        var hour = parseInt(dateComponents[3]);
        var minute = parseInt(dateComponents[4]);
        var second = parseInt(dateComponents[5]);
        
        var date = new Date(year, month, day, hour, minute, second);
        var options = { month: 'long', day: 'numeric', year: 'numeric' };
        var formattedDate = date.toLocaleDateString('en-US', options);
        
        var timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        var formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
        formattedDueDate = formattedDate + '<br>' + formattedTime;
    }

    var priorityClass = '';
    if (todo.priority === 'low') {
        priorityClass = 'table-primary';
    } else if (todo.priority === 'medium') {
        priorityClass = 'table-secondary';
    } else if (todo.priority === 'high') {
        priorityClass = 'table-danger';
    }

    var newBtn;

    if (todo.status === 'Paused' || todo.status === 'Not Started'){
        // Create the button element
        newBtn = $('<button class="btn btn-secondary btn-sm" data-todo-id="' + todo.id + '" id="startTask' + todo.id + '">\
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16">\
                                <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>\
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>\
                            </svg>\
                        </button>');
    }else {
        newBtn = $('<button class="btn btn-secondary btn-sm" data-todo-id="' + todo.id + '" id="pauseTask' + todo.id + '">\
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-btn" viewBox="0 0 16 16">\
                                <path d="M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5"/><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>\
                            </svg>\
                        </button>');
    }

    console.log(newBtn);


    // Populate the new row with todo data
    newRow.innerHTML = `
        <td>  
            <textarea class="form-control" id="taskTextArea${todo.id}" rows="2" maxlength="255" readonly>${todo.task}</textarea>
        </td>
        <td class="text-capitalize fw-semibold text-white ${priorityClass}">${todo.priority}</td>
        <td>
        ${formattedDueDate === "None" ? "None" : formattedDueDate}
        </td>
        <td>
            <span id="statusBadge${todo.id}" class="badge rounded-pill ${getStatusColorClass(todo.status)}">${todo.status}</span>
        </td>
        <td>
        ${todo.status != 'Completed' ?`
            <button class="btn btn-success btn-sm" data-todo-id="${todo.id}" id="completeTask${todo.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                </svg>
            </button>
            ${newBtn.prop('outerHTML')}
        `: ''}
        <button class="btn btn-primary btn-sm " data-todo-id="${todo.id}" id="editTask${todo.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
            </svg>
        </button>
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

// Function to get the Bootstrap color class based on the status value
function getStatusColorClass(status) {
    switch (status) {
        case 'Not Started':
            return 'bg-secondary';
        case 'In Progress':
            return 'bg-primary';
        case 'Completed':
            return 'bg-success';
        case 'Paused':
            return 'bg-danger';
        default:
            return ''; // Default class if status doesn't match any case
    }
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
        data: JSON.stringify({ status: 'Completed' }), // Mark the todo as completed
        success: function(response) {
            // Handle success response
            console.log('Todo marked as complete:', response.message);

            // Update the row to reflect the completed status
            editTodo(todoId, { status: 'Completed' });
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error marking todo as complete:', error);
        }
    });
}

function showEditModal(todoId) {
    // Find the row corresponding to the todoId
    var row = $('#row' + todoId);

    // Extract task data from the row
    var taskDescription = $('#taskTextArea' + todoId).val();
    var priority = row.find('td:nth-child(2)').text().trim();
    var formattedDueDateText = row.find('td:nth-child(3)').html().replace(/<br\s*\/?>/g, '\n');
    var status = $('#statusBadge' + todoId).text().trim();

    // Update modal title to "Edit Task"
    $('#taskModalLabel').text('Edit Task');

    // Populate modal fields with existing task data
    console.log(taskDescription);
    $('#taskDesc').val(taskDescription);
    $('#taskStatusSel').val(status);
    $('#taskPrioritySel').val(priority);
    $('#taskBtn').text('Save Task');

    // Set due date switch based on the presence of due date
    var dueDateSwitch = formattedDueDateText.trim() !== 'None';
    $('#taskDueDateSwitch').prop('checked', dueDateSwitch);

    if (dueDateSwitch) {
        // Split the date string into date and time components
        var parts = formattedDueDateText.split('\n').filter(Boolean);

        // Extract date and time parts using string slicing
        var dateStr = parts[0].trim();  // Include the comma and the following space
        var timeStr = parts[1].trim(); 

        // Parse the date string to get the date object
        var dateObj = new Date(dateStr);

        // Extract individual date components
        // Extract individual date components
        var year = dateObj.getFullYear();
        var month = ('0' + (dateObj.getMonth() + 1)).slice(-2); // Month is 0-indexed, so add 1 and pad with leading zeros
        var day = ('0' + dateObj.getDate()).slice(-2); // Pad with leading zeros

        // Trim leading and trailing spaces from the time string
        var timeString = timeStr.trim();

        // Split the time string into components
        var timeComponents = timeString.split(/:| /); // Split by colon or spac
        var hours = parseInt(timeComponents[0]).toString();
        var minutes = parseInt(timeComponents[1]).toString();
        minutes = minutes.length === 1 ? '0' + minutes : minutes;
        var ampm = timeComponents[3];

        $('#taskDatePicker').val(year + "-" + month + "-" + day); // Set date input value
        $('#taskHourSel').val(hours); // Set hour input value
        $('#taskMinSel').val(minutes); // Set minute input value
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
            editTodo(todoId, data);
            modalInstance.hide();
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error:', error);
        }
    });
}

function editTodo(todoId, data) {
    // Find the row corresponding to the todoId
    var row = $('#row' + todoId);

    // Update the task if it exists in data
    if (data.hasOwnProperty('task')) {
        $('#taskTextArea' + todoId).val(data.task);
    }

    // Update priority if it exists in data
    if (data.hasOwnProperty('priority')) {
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
    }

    // Update due date if it exists in data
    if (data.hasOwnProperty('due_date'))
    {
        if (data.due_date !== "") {
            var dateComponents = data.due_date.split(/[-T:Z]/);
            var year = parseInt(dateComponents[0]);
            var month = parseInt(dateComponents[1]) - 1; // Month is 0-indexed
            var day = parseInt(dateComponents[2]);
            var hour = parseInt(dateComponents[3]);
            var minute = parseInt(dateComponents[4]);
            var second = parseInt(dateComponents[5]);
            
            var date = new Date(year, month, day, hour, minute, second);
            var options = { month: 'long', day: 'numeric', year: 'numeric' };
            var formattedDate = date.toLocaleDateString('en-US', options);
            
            var timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            var formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
            var formattedDueDate = formattedDate + '<br>' + formattedTime;
            row.find('td:nth-child(3)').html(formattedDueDate);
        } else {
            row.find('td:nth-child(3)').text("None");
        }
    }

    // Update status if it exists in data
    if (data.hasOwnProperty('status')) {
        var statusClass = getStatusColorClass(data.status);
        $('#statusBadge' + todoId)
        .removeClass('bg-secondary bg-primary bg-danger bg-success') // Remove background color classes
        .addClass(statusClass)
        .text(data.status);

        updateActionButtons(todoId, data, row);
    }

}

function updateActionButtons(todoId, data, row){
    // Update action buttons if it exists in data
    if (data.hasOwnProperty('status')) {
        var buttonCreated = false;
        var compBtnId = '#completeTask' + todoId;
        var pauseBtnId = '#pauseTask' + todoId;
        var startBtnId = '#startTask' + todoId;

        var compBtnExists = $(compBtnId).length > 0;
        var pauseBtnExists = $(pauseBtnId).length > 0;
        var startBtnExists = $(startBtnId).length > 0;

        var targetTd = row.find('td:nth-child(5)'); 
        var secondChild = targetTd.children().eq(1);

        if (data.status === 'Completed') {
            // Remove the button if it exists and the status is 'Completed'
            if (compBtnExists) {
                $(compBtnId).hide();
            }
            if (pauseBtnExists) {
                $(pauseBtnId).hide();
            }
            if (startBtnExists) {
                $(startBtnId).hide();
            }
        } else if (data.status === 'Paused' || data.status === 'Not Started') {
            if (pauseBtnExists) {
                $(pauseBtnId).hide();
            }
            if (startBtnExists) {
                $(startBtnId).show();
            } else {

                // Create the button element
                var startBtn = $('<button class="btn btn-secondary btn-sm" data-todo-id="' + todoId + '" id="startTask' + todoId + '">\
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16">\
                                        <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>\
                                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>\
                                    </svg>\
                                </button>');

                // Append the button to the target td element
                startBtn.insertBefore(secondChild);
                buttonCreated = true;
                $(startBtnId).show();
            }
            if (compBtnExists) {
                $(compBtnId).show();
            } else {
                // Create the button element
                var compBtn = $('<button class="btn btn-success btn-sm" data-todo-id="' + todoId + '" id="completeTask' + todoId + '">\
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">\
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>\
                                </svg>\
                                </button>');

                // Append the button to the target td element
                targetTd.prepend(compBtn);
                buttonCreated = true;
                $(compBtnId).show();
            }
        } else {
            if (startBtnExists) {
                $(startBtnId).hide();
            }
            if (pauseBtnExists) {
                $(pauseBtnId).show();
            } else {
                // Create the button element
                var pauseBtn = $('<button class="btn btn-secondary btn-sm" data-todo-id="' + todoId + '" id="pauseTask' + todoId + '">\
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-btn" viewBox="0 0 16 16">\
                                        <path d="M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5"/><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>\
                                    </svg>\
                                </button>');

                // Append the button to the target td element
                // Insert the startBtm before the second child
                pauseBtn.insertBefore(secondChild);
                buttonCreated = true;
                $(pauseBtnId).show();
            }
            if (compBtnExists) {
                $(compBtnId).show();
            } else {
                // Create the button element
                var compBtn = $('<button class="btn btn-success btn-sm" data-todo-id="' + todoId + '" id="completeTask' + todoId + '">\
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">\
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>\
                                </svg>\
                                </button>');

                // Append the button to the target td element
                targetTd.prepend(compBtn);
                buttonCreated = true;
                $(compBtnId).show();
            }
        }
        if (buttonCreated){
            addTodoActionListeners();
        }
    }
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
        // Call the showEditModal function passing the todo ID
        showEditModal(todoId);
    });

    // jQuery code to handle click event on markascomplete button
    $("[id^='completeTask']").on('click', function() {
        // Get the todo ID from the data-todo-id attribute
        var todoId = $(this).data('todo-id');
        // Call the markAsComplete function passing the todo ID
        markAsComplete(todoId);
    });

    $("[id^='startTask']").on('click', function() {
        // Get the todo ID from the data-todo-id attribute
        var todoId = $(this).data('todo-id');
        startTask(todoId);
    });

    $("[id^='pauseTask']").on('click', function() {
        // Get the todo ID from the data-todo-id attribute
        var todoId = $(this).data('todo-id');
        pauseTask(todoId);
    });
}

function startTask(todoId){
    // AJAX request
    $.ajax({
        url: '/todos/' + todoId,
        type: 'PUT', // Use PUT method
        contentType: 'application/json', 
        data: JSON.stringify({ status: "In Progress" }), // Convert data to JSON string with only 'status' property
        dataType: 'json', 
        success: function(response) {
            // Handle success response
            console.log('Success:', response);
            editTodo(todoId,{ status: "In Progress" });
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error:', error);
        }
    });
}

function pauseTask(todoId){
    // AJAX request
    $.ajax({
        url: '/todos/' + todoId,
        type: 'PUT', // Use PUT method
        contentType: 'application/json', 
        data: JSON.stringify({ status: "Paused" }), // Convert data to JSON string with only 'status' property
        dataType: 'json', 
        success: function(response) {
            // Handle success response
            console.log('Success:', response);
            editTodo(todoId,{ status: "Paused" });
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error:', error);
        }
    });
}

function getAllUserTodos() {
    return $.ajax({
        url: '/todos',
        method: 'GET',
        dataType: 'json'
    });
}

function filterUserTodos(userTodos, searchString) {
    return userTodos.filter(function(todo) {
        return todo.task.toLowerCase().includes(searchString.toLowerCase());
    });
}

function clearTasks() {
    // Get all the rows in the table body
    const rows = $("#tablebody");

    rows.empty();
}