from app import *

LASTMESSAGE = list()
lastMessage = (
    db.session.query(History, Files)
    .join(Users)
    .join(Duo)
    .join(Files)
    .filter(History.sent_in == 3)
    .first()
)