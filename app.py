import os, json
from time import localtime, strftime
from flask import Flask, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send, emit, join_room, leave_room, rooms
from wtf_fields import *
from flask_login import (
    LoginManager,
    login_user,
    current_user,
    login_required,
    logout_user,
)

# Configure Application
app = Flask(__name__)
app.secret_key = "2lYBuvhkX6Z1iP8IZ8n7"  # os.environ.get("SECRET_KEY")

# Configure Database
app.app_context().push()
app.config["SQLALCHEMY_ECHO"] = True
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgresql://practicedb_j9l4_user:5BMCGCDq8PYDjKrt10E17HZsLf6MrWZy@dpg-cfag8hhgp3jsh6f4ost0-a.oregon-postgres.render.com/practicedb_j9l4"  # os.environ.get("DATABASE_URL")

db = SQLAlchemy(app)
from models.Users import Users, Duo, user_duo

# Initialize Flask-SocketIO
socketio = SocketIO(app)
ROOMS = []

# Configue flask Login
login = LoginManager(app)
login.init_app(app)


@login.user_loader
def load_user(id):
    return Users.query.get(int(id))


# Register Page Route
@app.route("/", methods=["GET", "POST"])
def index():
    reg_form = Registration()

    # Updated database if validation success
    if reg_form.validate_on_submit():

        # Fetch Uid and Password
        uid = reg_form.username.data
        pas = reg_form.password.data
        email = reg_form.email.data

        # Hash passwords
        password = pbkdf2_sha512.hash(pas)

        # Insert User to Database
        user = Users(username=uid, password=password, email=email)
        db.session.add(user)
        db.session.commit()
        if current_user.is_authenticated:
            return redirect(url_for("chat"))
        else:
            return redirect(url_for("login"))

    return render_template("index.html", form=reg_form)


@app.route("/login", methods=["GET", "POST"])
def login():
    login_form = LoginForm()

    # Allow login if validation success
    if login_form.validate_on_submit():
        user_object = Users.query.filter_by(username=login_form.username.data).first()
        login_user(user_object)

        return redirect(url_for("chat"))

    return render_template("login.html", form=login_form)


@app.route("/chat", methods=["GET", "POST"])
def chat():
    if not current_user.is_authenticated:
        flash("Please login", "danger")
        return redirect(url_for("login"))

    starts = [
        i.name
        for i in Duo.query.filter(Duo.name.startswith(current_user.username)).all()
    ]
    ends = [
        i.name for i in Duo.query.filter(Duo.name.endswith(current_user.username)).all()
    ]
    ROOMS = starts + ends
    return render_template("chat.html", username=current_user.username, rooms=ROOMS)


@app.route("/logout", methods=["GET"])
def logout():
    logout_user()
    flash("You have been logged out", "success")
    return redirect(url_for("login"))


@app.route("/api/<limit>", methods=["GET"])
def get_users(limit):
    users = Users.query.all()[: int(limit)]
    arr = []
    for user in users:
        arr.append({"username": user.username, "email": user.email})
    return json.dumps(arr)


@socketio.on("room")
def createRoom(data):
    requestor = data["requestor"]
    receiver = data["receiver"]

    user1 = Users.query.filter_by(username=requestor).first()
    user2 = Users.query.filter_by(username=receiver).first()

    roomName = f"{requestor} x {receiver}"
    room = (
        Duo.query.filter_by(name=roomName).first()
        or Duo.query.filter_by(name=f"{receiver} x {requestor}").first()
    )

    if room == None:
        newRoom = Duo(name=roomName)
        db.session.add(newRoom)
        user1.chats.append(newRoom)
        user2.chats.append(newRoom)
        db.session.commit()
    join_room(roomName)
    ROOMS = [i.name for i in Duo.query.all()]
    # newRoom = Duo(name=f"{user1} x {user2}")
    # user
    # join_room(user1)


@socketio.on("message")
def message(data):
    print(f"\n{data}\n")
    room = data["room"]
    emit(
        "secret",
        {
            "msg": data["msg"],
            "username": data["username"],
            "room": room,
            "timestamp": strftime("%b-%d %I:%M%p", localtime()),
        },
        to=room,
    )


@socketio.on("join")
def join(data):
    username = data["username"]
    room = data["room"]
    join_room(room)
    emit("info", {"msg": f"{username} has joined the {room} room."}, to=room)


@socketio.on("leave")
def leave(data):
    username = data["username"]
    room = data["room"]
    leave_room(room)
    emit("info", {"msg": f"{username} has left the {room} room."}, to=room)


if __name__ == "__main__":
    socketio.run(app)
