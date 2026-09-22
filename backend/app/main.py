from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.router import router as auth_router
from app.modules.candidates.router import router as candidates_router
from app.modules.requisitions.router import router as requisitions_router

app = FastAPI(title="Jaknot ATS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(requisitions_router)
app.include_router(candidates_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
