import os, json
from time import localtime, strftime
from datetime import datetime
from flask import (
    Flask,
    Blueprint,
    render_template,
    redirect,
    url_for,
    flash,
    Response,
    session,
    request,
)
from werkzeug.utils import secure_filename
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
from models.Users import Users, Duo, user_duo, History, Files, img

# Initialize Flask-SocketIO
socketio = SocketIO(app)
ROOMS = list()
NAMES = list()
LASTMESSAGE = list()

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

    NAMES = [duo.name for duo in current_user.chats]
    rooms = [name.split(current_user.username) for name in NAMES]
    rooms = [i[0].split(" x ") if i[0] != "" else i[1].split(" x ") for i in rooms]
    ROOMS = [j[0] if j[0] != "" else j[1] for j in rooms]
    ACTIVE = list()

    for i in range(len(NAMES)):
        ACTIVE.append(
            db.session.query(Users.active).filter_by(username=ROOMS[i]).first()[0]
        )
        duo = Duo.query.filter_by(name=NAMES[i]).first()
        lastMessage = (
            db.session.query(History, Files)
            .filter_by(sent_in=duo.id)
            .order_by(History.send_on.desc())
            .join(Files)
            .first()
        )

        if lastMessage.__class__.__name__ == "NoneType":
            LASTMESSAGE.append("")
        else:
            history, file = lastMessage
            if file.filetype == None:
                LASTMESSAGE.append(history.message)
            else:
                LASTMESSAGE.append(f"{file.filetype} {file.size}")
        lastMessage = None

    return render_template(
        "messages.html",
        username=current_user.username,
        length=len(ROOMS),
        names=NAMES,
        active=ACTIVE,
        lastmessage=LASTMESSAGE,
        rooms=ROOMS,
    )


@app.route("/profile", methods=["GET", "POST"])
def getProfile():
    return render_template("profile.html")


@app.route("/logout", methods=["GET"])
def logout():
    logout_user()
    flash("You have been logged out", "success")
    return redirect(url_for("login"))


@app.route("/upload/", methods=["GET", "POST"])
def upload():
    pic = request.files["pic"]
    if not pic:
        return "No Pic Uploaded", 400

    filename = secure_filename(pic.filename)
    mimetype = pic.mimetype

    if mimetype != "image/png":
        return "Images should be png", 400

    user = Users.query.filter_by(id=current_user.id).update(dict(profilepic=pic.read()))
    db.session.commit()

    return f"{mimetype}, {filename}"


@app.route("/profilepic/<username>", methods=["GET", "POST"])
def getProfilePic(username):
    image = db.session.query(Users.profilepic).filter_by(username=username).first()[0]
    if image == None:
        image = db.session.query(img.img).filter_by(id=1).first()
    return Response(image, mimetype="image/png")


@app.route("/api/<enteredUsername>", methods=["GET"])
def get_users(enteredUsername):
    users = (
        db.session.query(Users.username, Users.email)
        .filter(Users.username.ilike(f"%{enteredUsername}%"))
        .all()
    )
    arr = []
    for user in users:
        arr.append({"username": user.username, "email": user.email})
    return json.dumps(arr)


@app.route("/sharedfiles/<ids>")
def get_send_files(ids):
    files = Files.query.filter_by(messageid=ids).first()
    if not files:
        return "No file", 404
    return Response(files.binary, mimetype=files.filetype)


@socketio.on("connect")
def connect():
    Users.query.filter_by(id=current_user.id).update(dict(active=True))
    db.session.commit()


@socketio.on("disconnect")
def disconnect():
    Users.query.filter_by(id=current_user.id).update(dict(active=False))
    db.session.commit()


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
    room = Duo.query.filter_by(name=data["room"]).first()
    message = data["msg"]
    timestamp = strftime("%d %b %Y %I:%M %p", localtime())

    savemessage = History(
        message=message,
        send_by=current_user.id,
        sent_in=room.id,
        send_on=datetime.strptime(timestamp, "%d %b %Y %I:%M %p"),
    )
    db.session.add(savemessage)
    db.session.commit()

    files = Files(messageid=savemessage.id, binary=None)
    db.session.add(files)
    db.session.commit()

    emit(
        "secret",
        {
            "message": message,
            "sender": current_user.username,
            "room": room.name.title(),
            "time": timestamp,
        },
        to=room.name.title(),
    )


@socketio.on("history")
def getHistory(data):
    room = data["room"]
    user = data["user"]

    roomid = db.session.query(Duo.id).filter_by(name=room).one()[0]
    alls = (
        db.session.query(History, Duo, Users, Files)
        .join(Users)
        .join(Duo)
        .join(Files)
        .filter(History.sent_in == roomid)
        .order_by(History.send_on)
        .all()
    )

    array = []
    for history, duo, user, files in alls:
        array.append(
            {
                "type": files.filetype,
                "sender": user.username,
                "time": history.send_on.strftime("%d %b %Y %I:%M %p"),
                "room": duo.name.title(),
                "message": history.message,
                "id": history.id,
                "fileSize": files.size,
                "fileName": files.name,
            }
        )
    emit("pastmessages", array, to=room.title())


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


@socketio.on("audio-data")
def handle_audio_data(data):
    room = Duo.query.filter_by(name=data["room"]).first()
    filetype = data["fileType"]
    message = data["audio_data"]
    timestamp = strftime("%d %b %Y %I:%M %p", localtime())

    entry = History(
        message=None, send_by=current_user.id, sent_in=room.id, send_on=timestamp
    )
    db.session.add(entry)
    db.session.commit()

    savefile = Files(binary=message, messageid=entry.id, filetype=filetype)
    db.session.add(savefile)
    db.session.commit()

    info = {
        "audio_data": data["audio_data"],
        "sender": data["sender"],
        "room": data["room"],
    }
    emit(
        "audioBlob",
        info,
        to=data["room"].title(),
    )


@socketio.on("video")
def gotVideo(data):
    print(data)


@socketio.on("file-sender")
def sendFiles(data):
    print("data", data, end="\n\n\n")
    room = Duo.query.filter_by(name=data["room"]).one()
    filetype = data["type"]
    name = data["name"]
    file = data["blob"]
    size = data["size"]
    timestamp = strftime("%d %b %Y %I:%M %p", localtime())

    entry = History(
        message="", send_by=current_user.id, sent_in=room.id, send_on=timestamp
    )
    db.session.add(entry)
    db.session.commit()

    print("FILES ENTERED", end="\n\n\n\n\n\n\n\n")
    print(file)
    savefile = Files(
        name=name, binary=file, messageid=entry.id, filetype=filetype, size=size
    )
    db.session.add(savefile)
    db.session.commit()
    emit(
        "file-receiver",
        {
            "fileName": name,
            "fileSize": size,
            "sender": current_user.username,
            "id": entry.id,
            "type": filetype,
            "time": entry.send_on.strftime("%d %b %Y %I:%M %p"),
        },
    )


if __name__ == "__main__":
    socketio.run(app)
