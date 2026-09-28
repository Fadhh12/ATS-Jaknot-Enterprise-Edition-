import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.modules.folders import service
from app.modules.folders.schemas import FolderCreate, FolderOut, FolderUpdate

router = APIRouter(prefix="/api/v1/folders", tags=["folders"])

ANY_ROLE = ("recruiter_primary", "recruiter_admin", "hiring_manager", "recruiting_administrator")


@router.get("", response_model=list[FolderOut])
def list_folders(db: Session = Depends(get_db), _user=Depends(require_role(*ANY_ROLE))):
    return service.list_folders(db)


@router.post("", response_model=FolderOut, status_code=status.HTTP_201_CREATED)
def create_folder(payload: FolderCreate, db: Session = Depends(get_db), user=Depends(require_role(*ANY_ROLE))):
    return service.create_folder(db, payload, created_by=uuid.UUID(user["sub"]))


@router.patch("/{folder_id}", response_model=FolderOut)
def rename_folder(folder_id: uuid.UUID, payload: FolderUpdate, db: Session = Depends(get_db), _user=Depends(require_role(*ANY_ROLE))):
    return service.rename_folder(db, folder_id, payload)


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(folder_id: uuid.UUID, db: Session = Depends(get_db), _user=Depends(require_role(*ANY_ROLE))):
    service.delete_folder(db, folder_id)
