from eralchemy import render_er

## Draw from SQLAlchemy base
render_er(Base, "erd_from_sqlalchemy.png")

## Draw from database
render_er(
    "postgresql://chatapp_gamm_user:veUjJBD1aGAfgVFRHMHEhn0Bp0g2FLCv@dpg-cf415q6n6mps0qn9faug-a.oregon-postgres.render.com/chatapp_gamm",
    "erd_from_sqlite.png",
)
