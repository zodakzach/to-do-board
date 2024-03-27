import os
from flask import Flask, jsonify, request, render_template
from models import db, bcrypt, User
from dotenv import load_dotenv
from flask_login import (
    login_user,
    login_required,
    LoginManager,
    logout_user,
    current_user,
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


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if not all(key in data for key in ["email", "password"]):
        return jsonify({"error": "Missing required fields"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify({"error": "Invalid email", "field": "email"}), 401

    if not user.check_password(data["password"]):
        return jsonify({"error": "Invalid password", "field": "password"}), 401

    login_user(user)
    return jsonify({"message": "Login successful!"}), 200


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful!"}), 200


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        # Render the register.html template
        return render_template("register.html")
    elif request.method == "POST":
        data = request.json
        if not all(key in data for key in ["username", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400

        existing_email_user = User.query.filter_by(email=data["email"]).first()
        if existing_email_user:
            return jsonify({"error": "Email already exists", "field": "email"}), 400

        new_user = User(username=data["username"], email=data["email"])
        new_user.set_password(
            data["password"]
        )  # Set the password using the set_password method to hash it before storing
        db.session.add(new_user)
        try:
            db.session.commit()
            return jsonify({"message": "User created successfully!"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to create user", "details": str(e)}), 500


@app.teardown_request
def teardown_request(exception=None):
    db.session.close()


if __name__ == "__main__":
    initialize_database()  # initialize database tables
    app.run(debug=True)
