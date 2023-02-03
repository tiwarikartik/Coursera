from app import *

alls = (
    db.session.query(History, Users, Duo)
    .join(Users)
    .join(Duo)
    .filter(Duo.name == "kartik x kinjal")
    .all()
)  # .all()

array = []
for history, user, duo in alls:
    array.append(
        {
            "message": history.message,
            "username": user.username,
            "timestamp": history.send_on,
            "room": duo.name,
        }
    )

print(array)
