from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from flask_sqlalchemy import SQLAlchemy

# Define db instance without binding it to the Flask app
db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
