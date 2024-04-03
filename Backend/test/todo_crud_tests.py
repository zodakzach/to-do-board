import unittest
from flask import Flask
from flask_testing import TestCase
from datetime import datetime
from dotenv import load_dotenv
from flask_login import current_user, LoginManager, login_user, logout_user
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.todo_crud import db, Todo, todo_routes
from src.models import User


class TodoCRUDTestCase(TestCase):
    def create_app(self):
        app = Flask(
            __name__,
            static_folder="../../Frontend/static",
            template_folder="../../Frontend/templates",
        )
        app.config["TESTING"] = True
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

        # Load environment variables from .env file
        dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        if os.path.exists(dotenv_path):
            load_dotenv(dotenv_path)

        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        # Set the secret key from environment variables
        app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

        @app.route("/")
        def index():
            return "Hello, World!"

        # Initialize Flask-Login's LoginManager
        login_manager = LoginManager()
        login_manager.init_app(app)

        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))

        app.register_blueprint(todo_routes)
        db.init_app(app)
        return app

    def setUp(self):
        db.create_all()
        # Create a test user
        self.test_user = User(username="test_user", email="test@example.com")
        self.test_user.set_password("test_password")
        db.session.add(self.test_user)
        db.session.commit()
        login_user(self.test_user)

    def tearDown(self):
        logout_user()
        db.session.remove()
        db.drop_all()

    def test_create_todo(self):
        with self.client:
            # Simulate a POST request to create a todo
            response = self.client.post(
                "/todos",
                json={
                    "task": "Test Task",
                    "priority": "high",
                    "due_date": "2024-04-01T00:00:00Z",  # Example due date
                    "completed": False,
                },
            )
            self.assertEqual(response.status_code, 201)
            self.assertIn(b"Todo created successfully", response.data)

            # Check if the todo was added to the database
            todos = Todo.query.all()
            self.assertEqual(len(todos), 1)
            self.assertEqual(todos[0].task, "Test Task")
            self.assertEqual(todos[0].priority, "high")
            self.assertEqual(todos[0].due_date, datetime(2024, 4, 1, 0, 0))
            self.assertFalse(todos[0].completed)

            # Test with missing required fields
            response = self.client.post("/todos", json={})
            self.assertEqual(response.status_code, 400)
            self.assertIn(b"Task and priority are required", response.data)

    def test_get_all_todos(self):
        with self.client:
            # Simulate a GET request to retrieve all todos
            response = self.client.get("/todos")
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(response.json, list)
            self.assertEqual(len(response.json), 0)  # No todos initially

            # Add a todo to the database
            db.session.add(
                Todo(
                    user_id=self.test_user.id,
                    task="Test Task",
                    priority="high",
                    due_date=datetime(2024, 4, 1, 0, 0),
                    completed=False,
                )
            )
            db.session.commit()

            # Simulate another GET request after adding a todo
            response = self.client.get("/todos")
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(response.json, list)
            self.assertEqual(len(response.json), 1)

    def test_get_todo(self):
        with self.client:
            # Add a todo to the database
            db.session.add(
                Todo(
                    user_id=self.test_user.id,
                    task="Test Task",
                    priority="high",
                    due_date=datetime(2024, 4, 1, 0, 0),
                    completed=False,
                )
            )
            db.session.commit()

            # Simulate a GET request to retrieve the added todo
            todo_id = Todo.query.first().id
            response = self.client.get(f"/todos/{todo_id}")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json["task"], "Test Task")

            # Simulate a GET request for a non-existent todo
            response = self.client.get("/todos/1000")
            self.assertEqual(response.status_code, 404)
            self.assertIn(b"Todo not found", response.data)

    def test_update_todo(self):
        with self.client:
            # Add a todo to the database
            db.session.add(
                Todo(
                    user_id=self.test_user.id,
                    task="Test Task",
                    priority="high",
                    due_date=datetime(2024, 4, 1, 0, 0),
                    completed=False,
                )
            )
            db.session.commit()

            # Update the todo
            todo_id = Todo.query.first().id
            response = self.client.put(
                f"/todos/{todo_id}",
                json={
                    "task": "Updated Task",
                    "priority": "medium",
                    "due_date": "2024-04-15T00:00:00Z",  # Example updated due date
                    "completed": True,
                },
            )
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Todo updated successfully", response.data)

            # Check if the todo was updated in the database
            updated_todo = db.session.get(Todo, todo_id)
            self.assertEqual(updated_todo.task, "Updated Task")
            self.assertEqual(updated_todo.priority, "medium")
            self.assertEqual(updated_todo.due_date, datetime(2024, 4, 15, 0, 0))
            self.assertTrue(updated_todo.completed)

            # Test with non-existent todo
            response = self.client.put("/todos/1000", json={})
            self.assertEqual(response.status_code, 404)
            self.assertIn(b"Todo not found", response.data)

    def test_delete_todo(self):
        with self.client:
            # Add a todo to the database
            db.session.add(
                Todo(
                    user_id=self.test_user.id,
                    task="Test Task",
                    priority="high",
                    due_date=datetime(2024, 4, 1, 0, 0),
                    completed=False,
                )
            )
            db.session.commit()

            # Delete the todo
            todo_id = Todo.query.first().id
            response = self.client.delete(f"/todos/{todo_id}")
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Todo deleted successfully", response.data)

            # Check if the todo was deleted from the database
            self.assertIsNone(db.session.get(Todo, todo_id))

            # Test with non-existent todo
            response = self.client.delete("/todos/1000")
            self.assertEqual(response.status_code, 404)
            self.assertIn(b"Todo not found", response.data)

    # Similarly, write tests for the remaining routes: get_todo, update_todo, delete_todo


if __name__ == "__main__":
    unittest.main()
