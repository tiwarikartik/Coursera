from sqlalchemy_schemadisplay import create_schema_graph
from sqlalchemy import MetaData

graph = create_schema_graph(
    metadata=MetaData(
        "postgresql://chatapp_gamm_user:veUjJBD1aGAfgVFRHMHEhn0Bp0g2FLCv@dpg-cf415q6n6mps0qn9faug-a.oregon-postgres.render.com/chatapp_gamm"
    )
)
graph.write_png("dbschema.png")
