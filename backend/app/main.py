from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.base import Base
from app.db.seed import seed
from app.db.session import SessionLocal, engine
from app.modules.auth.router import router as auth_router
from app.modules.candidates.router import router as candidates_router
from app.modules.requisitions.router import router as requisitions_router

app = FastAPI(title="Jaknot ATS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3210",
        "http://127.0.0.1:3210",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(requisitions_router)
app.include_router(candidates_router)


@app.on_event("startup")
def on_startup() -> None:
    # Dev convenience: no Alembic migrations exist yet, so create tables and
    # seed a demo login + sample records on first boot against a fresh DB.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}
