from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from app import db


from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from app import db


user_duo = db.Table(
    "user_duo",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id")),
    db.Column("chat_id", db.Integer, db.ForeignKey("duo.id")),
)


class Users(UserMixin, db.Model):
    # User Model

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    email = db.Column(db.String(100), unique=True)
    active = db.Column(db.Boolean, default=False)
    chats = db.relationship("Duo", secondary=user_duo, backref="participants")

    def __repr__(self):
        return f"<User: {self.username}>\n"


class Duo(db.Model):
    __tablename__ = "duo"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, default=None)
    desc = db.Column(db.String, default=None)

    def __repr__(self):
        return f"<Duo: {self.name}>\n"
