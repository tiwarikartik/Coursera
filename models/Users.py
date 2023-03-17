from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from app import db
from datetime import datetime


user_duo = db.Table(
    "user_duo",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id")),
    db.Column("chat_id", db.Integer, db.ForeignKey("duo.id")),
)


class Users(UserMixin, db.Model):
    # User Model

    id = db.Column(db.Integer, primary_key=True)
    screen_name = db.Column(db.String)
    about = db.Column(db.String)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    email = db.Column(db.String(100), unique=True)
    active = db.Column(db.Boolean, default=False)
    profilepic = db.Column(db.LargeBinary, default=None)
    chats = db.relationship("Duo", secondary=user_duo, backref="participants")
    messages = db.relationship("History", backref="sender")


class Duo(db.Model):
    __tablename__ = "duo"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, default=None)
    desc = db.Column(db.String, default=None)
    message = db.relationship("History", backref="chat")


class History(db.Model):
    __tablename__ = "history"
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String)
    send_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    sent_in = db.Column(db.Integer, db.ForeignKey("duo.id"))
    send_on = db.Column(db.DateTime, default=datetime.utcnow())
    files = db.relationship("Files", backref="message")


class Files(db.Model):
    __tablename__ = "files"
    id = db.Column(db.Integer, primary_key=True)
    binary = db.Column(db.LargeBinary)
    messageid = db.Column(db.Integer, db.ForeignKey("history.id"))
    filetype = db.Column(db.String, default=None)
    name = db.Column(db.String, default=None)
    size = db.Column(db.String, default=None)


class img(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String)
    img = db.Column(db.LargeBinary)
