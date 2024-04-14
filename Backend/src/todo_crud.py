from flask import Blueprint, jsonify, request
from src.models import db, Todo
from flask_login import current_user, login_required
from datetime import datetime


todo_routes = Blueprint("todo_routes", __name__)


@todo_routes.route("/todos", methods=["POST"])
@login_required
def create_todo():
    data = request.json  # Assuming data is sent in JSON format

    # Extracting data from the request
    task = data.get("task")
    priority = data.get("priority")
    due_date_str = data.get("due_date")
    status = data.get("status")

    # Validating the required fields
    if not task or not priority:
        return jsonify({"error": "Task and priority are required"}), 400

    if due_date_str != "":
        due_date = datetime.strptime(due_date_str, "%Y-%m-%dT%H:%M:%SZ")
    else:
        due_date = None

    try:
        # Creating a new todo object
        new_todo = Todo(
            user_id=current_user.id,  # Assuming user is logged in
            task=task,
            priority=priority,
            due_date=due_date,
            status=status,
        )

        # Adding the new todo to the session and committing changes
        db.session.add(new_todo)
        db.session.commit()

        serialized_todo = new_todo.serialize()

        # Remove the user_id from the serialized data
        serialized_todo.pop("user_id", None)

        # Combine the success message and serialized todo into a single dictionary
        response_data = {
            "message": "Todo created successfully",
            "todo": serialized_todo,
        }

        return jsonify(response_data), 201
    except ValueError:
        # Handle the case where priority or status values are not valid enums
        error_message = {"error": "Invalid priority or status value provided"}
        return jsonify(error_message), 400


@todo_routes.route("/todos", methods=["GET"])
@login_required
def get_all_todos():
    # Get all todos for the current user
    todos = Todo.query.filter_by(user_id=current_user.id).all()
    # Serialize todos
    serialized_todos = [todo.serialize() for todo in todos]
    return jsonify(serialized_todos)


@todo_routes.route("/todos/<int:id>", methods=["GET"])
@login_required
def get_todo(id):
    # Get the todo with the specified ID belonging to the current user
    todo = Todo.query.filter_by(id=id, user_id=current_user.id).first()
    if todo:
        return jsonify(todo.serialize())
    else:
        return jsonify({"error": "Todo not found"}), 404


@todo_routes.route("/todos/<int:id>", methods=["PUT"])
@login_required
def update_todo(id):
    # Get the todo with the specified ID belonging to the current user
    todo = Todo.query.filter_by(id=id, user_id=current_user.id).first()
    if not todo:
        return jsonify({"error": "Todo not found"}), 404

    # Get data from the request
    data = request.json

    # Update todo attributes if provided in the request
    if "task" in data:
        todo.task = data["task"]
    if "priority" in data:
        todo.priority = data["priority"]
    if "due_date" in data and data["due_date"] != "":
        due_date_str = data["due_date"]
        if due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%dT%H:%M:%SZ")
                todo.due_date = due_date
            except ValueError:
                return (
                    jsonify(
                        {
                            "error": "Invalid due date format. Please use YYYY-MM-DDTHH:MM:SSZ format."
                        }
                    ),
                    400,
                )
    elif "due_date" in data and data["due_date"] == "":
        todo.due_date = None
    if "status" in data:
        todo.status = data["status"]
    # Commit changes to the database
    db.session.add(todo)
    db.session.commit()

    return jsonify({"message": "Todo updated successfully"})


@todo_routes.route("/todos/<int:id>", methods=["DELETE"])
@login_required
def delete_todo(id):
    # Get the todo with the specified ID belonging to the current user
    todo = Todo.query.filter_by(id=id, user_id=current_user.id).first()
    if not todo:
        return jsonify({"error": "Todo not found"}), 404

    # Delete the todo
    db.session.delete(todo)
    db.session.commit()

    return jsonify({"message": "Todo deleted successfully"})
