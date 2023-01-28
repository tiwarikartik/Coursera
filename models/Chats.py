from flask_sqlalchemy import SQLAlchemy
from app import db


class Chats(db.Model):
    __tablename__ = "chats"
    id = db.Column(db.Integer, primary_key=True)
    participant1 = db.Column()
