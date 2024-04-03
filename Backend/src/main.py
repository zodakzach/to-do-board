import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Flask, jsonify, request, render_template
from src.models import db, bcrypt, User
from dotenv import load_dotenv
from src.auth import auth_routes
from todo_crud import todo_routes
from flask_login import (
    login_required,
    LoginManager,
)

app = Flask(
    __name__,
    static_folder="../../Frontend/static",
    template_folder="../../Frontend/templates",
)

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Database Connection (sqlite for dev)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///../todo_board.db"

# Database Connection (postgresql for production)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@hostname/database_name'

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Set the secret key from environment variables
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

db.init_app(app)
bcrypt.init_app(app)

login_manager = LoginManager(app)
login_manager.login_view = "/"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.teardown_request
def teardown_request(exception=None):
    db.session.close()


def initialize_database():
    """
    Initialize database tables.
    """
    with app.app_context():
        db.create_all()


# Routes


@app.route("/")
def index():
    # Render the index.html template
    return render_template("index.html")


@app.route("/todo-list")
@login_required
def todo_list():
    return render_template("todo-list.html")


# auth routes
app.register_blueprint(auth_routes)

# todo crud routes
app.register_blueprint(todo_routes)


if __name__ == "__main__":
    initialize_database()  # initialize database tables

    # Define the IP and port
    ip = "127.0.0.1"
    port = 5000

    app.run(host=ip, port=port, debug=True)
