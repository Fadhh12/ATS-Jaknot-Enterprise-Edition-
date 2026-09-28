import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.dependencies import require_role

router = APIRouter(prefix="/api/v1/uploads", tags=["uploads"])

UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "uploads"
CV_DIR = UPLOAD_ROOT / "cv"
CV_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_SIZE_BYTES = 8 * 1024 * 1024


@router.post("/cv", status_code=status.HTTP_201_CREATED)
async def upload_cv(
    file: UploadFile = File(...),
    _user=Depends(require_role("recruiter_primary", "recruiter_admin", "recruiting_administrator")),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF, DOC, or DOCX files are accepted")

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 8MB limit")

    stored_name = f"{uuid.uuid4()}{ext}"
    (CV_DIR / stored_name).write_bytes(content)

    return {"url": f"/uploads/cv/{stored_name}", "filename": file.filename}
