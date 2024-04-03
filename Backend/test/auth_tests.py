import unittest
from flask import Flask
from flask_testing import TestCase
from dotenv import load_dotenv
from flask_login import login_user, logout_user, current_user, LoginManager
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.auth import db, User, auth_routes


class AuthTestCase(TestCase):
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

        app.register_blueprint(auth_routes)
        db.init_app(app)
        return app

    def setUp(self):
        db.create_all()
        # Create a test user
        self.test_user = User(username="test_user", email="test@example.com")
        self.test_user.set_password("test_password")
        db.session.add(self.test_user)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_login(self):
        with self.client:
            response = self.client.post(
                "/auth/login",
                json={"email": "test@example.com", "password": "test_password"},
            )
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Login successful", response.data)
            self.assertTrue(current_user.is_authenticated)

    def test_login_invalid_email(self):
        with self.client:
            response = self.client.post(
                "/auth/login",
                json={"email": "invalid@example.com", "password": "test_password"},
            )
            self.assertEqual(response.status_code, 401)
            self.assertIn(b"Invalid email", response.data)
            self.assertFalse(current_user.is_authenticated)

    def test_login_invalid_password(self):
        with self.client:
            response = self.client.post(
                "/auth/login",
                json={"email": "test@example.com", "password": "invalid_password"},
            )
            self.assertEqual(response.status_code, 401)
            self.assertIn(b"Invalid password", response.data)
            self.assertFalse(current_user.is_authenticated)

    def test_logout(self):
        with self.client:
            # Login first
            self.client.post(
                "/auth/login",
                json={"email": "test@example.com", "password": "test_password"},
            )
            response = self.client.get("/auth/logout")
            self.assertEqual(response.status_code, 302)  # Redirects to index
            self.assertFalse(current_user.is_authenticated)

    def test_register_get(self):
        with self.client:
            response = self.client.get("/auth/register")
            self.assertEqual(response.status_code, 200)
            self.assertIn(
                b"REGISTER", response.data
            )  # Assuming the template renders 'register.html'

    def test_register_post(self):
        with self.client:
            # Simulate a POST request with valid data
            response = self.client.post(
                "/auth/register",
                json={
                    "username": "test_user",
                    "email": "test1@example.com",  # MUST BE A UNIQUE EMAIL NOT IN THE DATABASE ALREADY TO PASS
                    "password": "test_password",
                },
            )
            self.assertEqual(response.status_code, 201)
            self.assertIn(b"User created successfully!", response.data)

            # Check if the user was added to the database
            user = User.query.filter_by(email="test@example.com").first()
            self.assertIsNotNone(user)
            self.assertEqual(user.username, "test_user")

            # Simulate a POST request with missing data
            response = self.client.post("/auth/register", json={})
            self.assertEqual(response.status_code, 400)
            self.assertIn(b"Missing required fields", response.data)


if __name__ == "__main__":
    unittest.main()
