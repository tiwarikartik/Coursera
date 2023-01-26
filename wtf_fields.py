from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, EqualTo, ValidationError
from passlib.hash import pbkdf2_sha512


def invalid_credentials(form, field):
    # Username and password checker
    from models.Users import Users

    username_entered = form.username.data
    password_entered = form.password.data
    user_object = Users.query.filter_by(username=username_entered).first()
    if user_object is None:
        raise ValidationError("Username or Password is incorrect")
    elif not pbkdf2_sha512.verify(password_entered, user_object.password):
        raise ValidationError("Username or Password is incorrect")


class Registration(FlaskForm):
    # Registration Form

    username = StringField(
        "username_label",
        validators=[
            InputRequired(message="Username required"),
            Length(
                min=4, max=25, message="Username must be between 4 and 25 characters"
            ),
        ],
    )
    password = PasswordField(
        "password_label",
        validators=[
            InputRequired(message="Password required"),
            Length(
                min=4, max=25, message="Password must be between 4 and 25 characters"
            ),
        ],
    )
    confirm_password = PasswordField(
        "confirm_password_label",
        validators=[
            InputRequired(message="Username required"),
            Length(
                min=4, max=25, message="Username must be between 4 and 25 characters"
            ),
            EqualTo("password", message="Passwords must match"),
        ],
    )
    submit_button = SubmitField("Create")

    def validate_username(self, username):
        from models.Users import Users

        user_object = Users.query.filter_by(username=username.data).first()
        print(user_object)
        if user_object is not None:
            raise ValidationError("Username already exists")


class LoginForm(FlaskForm):
    # Login Form

    username = StringField(
        "username_label",
        validators=[
            InputRequired(message="Username required"),
        ],
    )
    password = PasswordField(
        "password_label",
        validators=[InputRequired(message="Password required"), invalid_credentials],
    )
    submit_button = SubmitField("Login")
    register_button = SubmitField("Register")
