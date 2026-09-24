"""Idempotent dev-only seed data so the frontend has something real to render
against a fresh database, instead of only ever showing frontend dummy fallback."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.modules.auth.models import User
from app.modules.candidates.models import Candidate
from app.modules.candidates.service import build_folder_path
from app.modules.requisitions.models import JobRequisition


def seed(db: Session) -> None:
    admin = db.query(User).filter(User.email == settings.seed_admin_email).first()
    if not admin:
        admin = User(
            name=settings.seed_admin_name,
            email=settings.seed_admin_email,
            password_hash=hash_password(settings.seed_admin_password),
            role="admin",
        )
        db.add(admin)
        db.flush()

    if db.query(JobRequisition).count() == 0:
        db.add_all(
            [
                JobRequisition(
                    position_title="Warehouse Supervisor",
                    department_id="Warehouse",
                    quantity=2,
                    justification="Backlog in outbound shipments needs a dedicated supervisor.",
                    budget_range="Rp8M-Rp10M",
                    status="Pending Approval",
                    created_by=admin.id,
                    created_at=datetime.utcnow() - timedelta(days=2),
                ),
                JobRequisition(
                    position_title="Recruitment Admin",
                    department_id="HRGA",
                    quantity=1,
                    justification="Support growing hiring volume for warehouse roles.",
                    budget_range="Rp6M-Rp8M",
                    status="Approved",
                    created_by=admin.id,
                    created_at=datetime.utcnow() - timedelta(days=3),
                ),
                JobRequisition(
                    position_title="Graphic Designer",
                    department_id="Marketing",
                    quantity=1,
                    justification="Campaign assets backlog for Q4 launch.",
                    budget_range="Rp7M-Rp9M",
                    status="Draft",
                    created_by=admin.id,
                    created_at=datetime.utcnow() - timedelta(days=4),
                ),
                JobRequisition(
                    position_title="Store Crew",
                    department_id="Operations",
                    quantity=8,
                    justification="New store opening next month.",
                    budget_range="Rp4.5M-Rp5.5M",
                    status="Approved",
                    created_by=admin.id,
                    created_at=datetime.utcnow() - timedelta(days=5),
                ),
            ]
        )

    if db.query(Candidate).count() == 0:
        # (name, email, phone, position, stage, applicant_type, duplicate_type)
        # Rizky and Fajar each reapply later under the same email/phone, to
        # demo both duplicate badges: same position vs. a different one.
        seed_candidates = [
            ("Aisyah Putri", "aisyah@candidate.test", "+62 812-3456-7890", "Warehouse Supervisor", "Screening", "Full-time", None),
            ("Rizky Pratama", "rizky@candidate.test", "+62 813-2211-4590", "Warehouse Supervisor", "Applied", "Daily Worker", None),
            ("Dina Sari", "dina@candidate.test", "+62 811-7788-2200", "Recruitment Admin", "Shortlist", "Full-time", None),
            ("Fajar Adi", "fajar@candidate.test", "+62 817-4433-9021", "Graphic Designer", "Applied", "Full-time", None),
            ("Nadia Wulan", "nadia@candidate.test", "+62 815-6690-3312", "Recruitment Admin", "Hired", "Daily Worker", None),
            ("Rizky Pratama", "rizky@candidate.test", "+62 813-2211-4590", "Warehouse Supervisor", "Screening", "Daily Worker", "same_position"),
            ("Fajar Adi", "fajar@candidate.test", "+62 817-4433-9021", "Store Crew", "Applied", "Full-time", "different_position"),
        ]
        now = datetime.utcnow()
        for i, (name, email, phone, position, stage, applicant_type, duplicate_type) in enumerate(seed_candidates):
            applied_at = now - timedelta(days=len(seed_candidates) - i)
            db.add(
                Candidate(
                    full_name=name,
                    email=email,
                    phone=phone,
                    cv_file_url=f"https://storage.local/cv/{email}.pdf",
                    position_title=position,
                    stage=stage,
                    applicant_type=applicant_type,
                    duplicate_type=duplicate_type,
                    folder_path=build_folder_path(position, stage, applied_at),
                    applied_at=applied_at,
                )
            )

    db.commit()
