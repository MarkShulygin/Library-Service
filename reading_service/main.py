from fastapi import FastAPI
from reading_service.routes import reading_routes
from reading_service.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(reading_routes.router)
