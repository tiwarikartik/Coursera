from flask import Flask, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
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
app.secret_key = "REPLACE IT LATER WITH ENV VAR"

# Configure Database
app.app_context().push()
app.config["SQLALCHEMY_ECHO"] = True
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgresql://chatapp_gamm_user:veUjJBD1aGAfgVFRHMHEhn0Bp0g2FLCv@dpg-cf415q6n6mps0qn9faug-a.oregon-postgres.render.com/chatapp_gamm"

db = SQLAlchemy(app)
from models.Users import Users

# Configue flask Login
login = LoginManager(app)
login.init_app(app)


@login.user_loader
def load_user(id):
    return Users.query.get(int(id))


# Home Page Route
@app.route("/", methods=["GET", "POST"])
def index():
    if current_user.is_authenticated:
        return redirect(url_for("chat"))
    else:
        return redirect(url_for("login"))


# Register Page Route
@app.route("/register", methods=["GET", "POST"])
def register():
    reg_form = Registration()

    # Updated database if validation success
    if reg_form.validate_on_submit():

        # Fetch Uid and Password
        uid = reg_form.username.data
        pas = reg_form.password.data

        # Hash passwords
        password = pbkdf2_sha512.hash(pas)

        # Insert User to Database
        user = Users(username=uid, password=password)
        db.session.add(user)
        db.session.commit()

        flash("Registered Successfully. Please Login", "success")
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
    return "Chat with me"


@app.route("/logout", methods=["GET"])
def logout():
    logout_user()
    flash("You have been logged out", "success")
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(debug=True)
