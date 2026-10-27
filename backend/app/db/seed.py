"""Idempotent dev-only seed data so the frontend has something real to render
against a fresh database, instead of only ever showing frontend dummy fallback."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.modules.auth.models import User
from app.modules.candidates.models import Candidate
from app.modules.candidates.service import build_folder_path
from app.modules.requisitions.models import JobRequisition, RequisitionApproval
from app.modules.screening.models import ScorecardTemplate


# One dev login per role so each can be tried without a separate register call.
SEED_ROLE_USERS = [
    ("Rina Recruiter", "rina.recruiter@jaknot-ats.com", "recruiter_primary"),
    ("Budi Admin", "budi.recruiteradmin@jaknot-ats.com", "recruiter_admin"),
    ("Hasan Hiring", "hasan.hiringmanager@jaknot-ats.com", "hiring_manager"),
]


def seed(db: Session) -> None:
    admin = db.query(User).filter(User.email == settings.seed_admin_email).first()
    if not admin:
        admin = User(
            name=settings.seed_admin_name,
            email=settings.seed_admin_email,
            password_hash=hash_password(settings.seed_admin_password),
            role="recruiting_administrator",
        )
        db.add(admin)
        db.flush()

    for name, email, role in SEED_ROLE_USERS:
        if not db.query(User).filter(User.email == email).first():
            db.add(
                User(
                    name=name,
                    email=email,
                    password_hash=hash_password(settings.seed_admin_password),
                    role=role,
                )
            )

    if db.query(JobRequisition).count() == 0:
        pending = JobRequisition(
            position_title="Warehouse Supervisor",
            department_id="Warehouse",
            quantity=2,
            justification="Backlog in outbound shipments needs a dedicated supervisor.",
            budget_range="Rp8M-Rp10M",
            status="Pending Approval",
            created_by=admin.id,
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add(pending)
        db.flush()
        db.add(RequisitionApproval(requisition_id=pending.id, approver_id=admin.id, sequence=1))

        db.add_all(
            [
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

    if db.query(ScorecardTemplate).count() == 0:
        db.add_all(
            [
                ScorecardTemplate(
                    name="Standard Screening Scorecard",
                    position_title=None,
                    criteria=[
                        {"name": "Relevant Experience", "weight": 30, "description": "Years and relevance of past work to the role."},
                        {"name": "Skills & Knowledge", "weight": 25, "description": "Technical and functional command of the job."},
                        {"name": "Communication", "weight": 20, "description": "Clarity, listening and responsiveness."},
                        {"name": "Problem Solving", "weight": 15, "description": "Structured thinking under operational pressure."},
                        {"name": "Culture & Teamwork", "weight": 10, "description": "Fit with the Jaknot working culture."},
                    ],
                    pass_threshold=70,
                    hold_threshold=50,
                    is_default=True,
                    created_by=admin.id,
                    created_at=datetime.utcnow() - timedelta(days=6),
                ),
                ScorecardTemplate(
                    name="Daily Worker Screening",
                    position_title="Store Crew",
                    criteria=[
                        {"name": "Attendance Reliability", "weight": 35, "description": "History of consistent attendance and punctuality."},
                        {"name": "Physical Readiness", "weight": 30, "description": "Fitness for warehouse and store floor duties."},
                        {"name": "Experience", "weight": 20, "description": "Prior retail or warehouse experience."},
                        {"name": "Attitude", "weight": 15, "description": "Willingness and discipline on the floor."},
                    ],
                    pass_threshold=70,
                    hold_threshold=50,
                    is_default=False,
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
