from flask import Flask, jsonify, request, render_template
from models import db, User

app = Flask(
    __name__,
    static_folder="../../Frontend/static",
    template_folder="../../Frontend/templates",
)

# Database Connection (sqlite for dev)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///../todo_board.db"

# Database Connection (postgresql for production)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@hostname/database_name'

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


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


@app.route("/register")
def register():
    # Render the register.html template
    return render_template("register.html")


@app.route("/create_users", methods=["POST"])
def create_user():
    data = request.json
    if not all(key in data for key in ["username", "email", "password"]):
        return jsonify({"error": "Missing required fields"}), 400

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
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create user", "details": str(e)}), 500


@app.teardown_request
def teardown_request(exception=None):
    db.session.close()


if __name__ == "__main__":
    initialize_database()  # initialize database tables
    app.run(debug=True)
