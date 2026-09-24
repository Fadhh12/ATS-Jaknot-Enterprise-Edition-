import uuid

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.candidates.models import Candidate
from app.modules.folders.models import Folder
from app.modules.folders.schemas import FolderCreate, FolderUpdate


def _with_counts(db: Session, folders: list[Folder]) -> list[Folder]:
    counts = dict(
        db.query(Candidate.folder_id, func.count(Candidate.id)).group_by(Candidate.folder_id).all()
    )
    for f in folders:
        f.candidate_count = counts.get(f.id, 0)
    return folders


def list_folders(db: Session) -> list[Folder]:
    folders = db.query(Folder).order_by(Folder.created_at.desc()).all()
    return _with_counts(db, folders)


def create_folder(db: Session, payload: FolderCreate, created_by: uuid.UUID) -> Folder:
    folder = Folder(name=payload.name.strip(), created_by=created_by)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    folder.candidate_count = 0
    return folder


def rename_folder(db: Session, folder_id: uuid.UUID, payload: FolderUpdate) -> Folder:
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    folder.name = payload.name.strip()
    db.commit()
    db.refresh(folder)
    folder.candidate_count = db.query(Candidate).filter(Candidate.folder_id == folder_id).count()
    return folder


def delete_folder(db: Session, folder_id: uuid.UUID) -> None:
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    db.query(Candidate).filter(Candidate.folder_id == folder_id).update({Candidate.folder_id: None})
    db.delete(folder)
    db.commit()
