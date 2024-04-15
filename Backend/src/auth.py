from flask import Blueprint, request, render_template, jsonify, redirect, url_for
from src.models import db, User
from flask_login import (
    login_user,
    login_required,
    logout_user,
    current_user,
)

auth_routes = Blueprint("auth_routes", __name__)


@auth_routes.route("/auth/login", methods=["POST"])
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


@auth_routes.route("/auth/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


@auth_routes.route("/auth/register", methods=["GET", "POST"])
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


@auth_routes.route("/auth/update", methods=["PUT"])
@login_required
def update_user():
    data = request.json
    try:
        # Check if the updated email already exists
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != current_user.id:
                return jsonify({"error": "Email address already exists. Please choose a different one.", "field": "email"}), 400
        current_user.update_user(data)
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update user", "details": str(e)}), 500


@auth_routes.route("/auth/delete", methods=["DELETE"])
@login_required
def delete_user():
    current_user.delete_user()
    logout_user()  # Optionally log out the user after deleting their account
    return jsonify({"message": "User deleted successfully"}), 200
