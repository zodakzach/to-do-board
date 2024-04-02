from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import UserMixin

# Define db instance without binding it to the Flask app
db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)


class Todo(db.Model):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # ForeignKey added here
    task = Column(String(255), nullable=False)
    priority = Column(
        Enum("low", "medium", "high", name="priority_enum"), nullable=False
    )
    due_date = Column(DateTime(timezone=True))  # Optional due_date
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Todo(id={self.id}, task='{self.task}', priority='{self.priority}', completed={self.completed}, due_date={self.due_date})>"

    # Define serialize method
    def serialize(self):
        serialized_due_date = (
            self.due_date.strftime("%Y-%m-%dT%H:%M:%SZ")
            if self.due_date is not None
            else None
        )
        serialized_updated_at = (
            self.updated_at.strftime("%Y-%m-%dT%H:%M:%SZ")
            if self.updated_at is not None
            else None
        )

        return {
            "id": self.id,
            "user_id": self.user_id,
            "task": self.task,
            "priority": self.priority,
            "due_date": serialized_due_date,
            "completed": self.completed,
            "created_at": self.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "updated_at": serialized_updated_at,
        }
