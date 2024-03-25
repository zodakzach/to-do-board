from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

app = Flask(__name__, static_folder="../Frontend/static")

# Database Connection (sqlite for dev)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///../todo_board.db"

# Database Connection (postgresql for production)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@hostname/database_name'

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Importing User model from models.py
from models import User

# Create all tables within the application context
with app.app_context():
    db.create_all()

# Routes


@app.route("/")
def index():
    return "Hello, world!"


@app.route("/create_users", methods=["POST"])
def create_user():
    data = request.json
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already exists"}), 400

    new_user = User(
        username=data["username"], email=data["email"], password=data["password"]
    )
    db.session.add(new_user)
    try:
        db.session.commit()
        return jsonify({"message": "User created successfully!"}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Failed to create user"}), 500


if __name__ == "__main__":
    app.run(debug=True)
