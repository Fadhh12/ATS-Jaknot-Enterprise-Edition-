import type { Candidate, Requisition } from "@/lib/api";

// Realistic placeholder data used until the FastAPI backend (see /backend) is
// running and seeded. Swapped out transparently once /api/v1/* responds.

export const dummyRequisitions: Requisition[] = [
  {
    id: "req-1",
    position_title: "Warehouse Supervisor",
    department_id: "Warehouse",
    quantity: 2,
    status: "Pending Approval",
    salary_range: "Rp8M–Rp10M",
    created_by: "Rizky",
    created_at: "2026-09-21T08:00:00Z",
  },
  {
    id: "req-2",
    position_title: "Recruitment Admin",
    department_id: "HRGA",
    quantity: 1,
    status: "Approved",
    salary_range: "Rp6M–Rp8M",
    created_by: "Nabil",
    created_at: "2026-09-20T08:00:00Z",
  },
  {
    id: "req-3",
    position_title: "Graphic Designer",
    department_id: "Marketing",
    quantity: 1,
    status: "Draft",
    salary_range: "Rp7M–Rp9M",
    created_by: "Alya",
    created_at: "2026-09-19T08:00:00Z",
  },
  {
    id: "req-4",
    position_title: "Store Crew",
    department_id: "Operations",
    quantity: 8,
    status: "Approved",
    salary_range: "Rp4.5M–Rp5.5M",
    created_by: "Dimas",
    created_at: "2026-09-18T08:00:00Z",
  },
];

export const dummyCandidates: Candidate[] = [
  {
    id: "cand-aisyah",
    full_name: "Aisyah Putri",
    email: "aisyah@candidate.test",
    applicant_type: "Full-time",
    position_title: "Warehouse Supervisor",
    stage: "Screening",
    folder_path: "Warehouse Supervisor/Screening",
    applied_at: "2026-09-21T00:00:00Z",
    phone: "+62 812-3456-7890",
    experience: "4 yrs · Logistics Supervisor",
    cv_file: "Aisyah_Putri_CV.pdf",
  },
  {
    id: "cand-rizky",
    full_name: "Rizky Pratama",
    email: "rizky@candidate.test",
    applicant_type: "Daily Worker",
    position_title: "Warehouse Supervisor",
    stage: "Applied",
    folder_path: "Warehouse Supervisor/Applied",
    applied_at: "2026-09-20T00:00:00Z",
    phone: "+62 813-2211-4590",
    experience: "2 yrs · Warehouse Operator",
    cv_file: "Rizky_Pratama_CV.pdf",
  },
  {
    id: "cand-dina",
    full_name: "Dina Sari",
    email: "dina@candidate.test",
    applicant_type: "Full-time",
    position_title: "Recruitment Admin",
    stage: "Shortlist",
    folder_path: "Recruitment Admin/Screening",
    applied_at: "2026-09-19T00:00:00Z",
    phone: "+62 811-7788-2200",
    experience: "3 yrs · HR Administration",
    cv_file: "Dina_Sari_CV.pdf",
  },
  {
    id: "cand-fajar",
    full_name: "Fajar Adi",
    email: "fajar@candidate.test",
    applicant_type: "Full-time",
    position_title: "Graphic Designer",
    stage: "Applied",
    folder_path: "Graphic Designer/Applied",
    applied_at: "2026-09-18T00:00:00Z",
    phone: "+62 817-4433-9021",
    experience: "5 yrs · Brand & Visual Design",
    cv_file: "Fajar_Adi_CV.pdf",
  },
  {
    id: "cand-nadia",
    full_name: "Nadia Wulan",
    email: "nadia@candidate.test",
    applicant_type: "Daily Worker",
    position_title: "Recruitment Admin",
    stage: "Hired",
    folder_path: "Recruitment Admin/Hired",
    applied_at: "2026-09-17T00:00:00Z",
    phone: "+62 815-6690-3312",
    experience: "1 yr · HR Support",
    cv_file: "Nadia_Wulan_CV.pdf",
  },
  {
    id: "cand-raka",
    full_name: "Raka Kurnia",
    email: "raka@candidate.test",
    applicant_type: "Full-time",
    position_title: "Graphic Designer",
    stage: "Applied",
    folder_path: "Graphic Designer/Applied",
    applied_at: "2026-09-16T00:00:00Z",
    phone: "+62 819-2245-6610",
    experience: "2 yrs · Visual Design (possible duplicate of Fajar Adi)",
    cv_file: "Raka_Kurnia_CV.pdf",
    possible_duplicate: true,
  },
];

export const pendingApprovals = [
  { id: "req-1", title: "Warehouse Supervisor", department: "Warehouse", waitingOn: "Rizky" },
  { id: "req-4", title: "Store Crew", department: "Operations", waitingOn: "Dimas" },
  { id: "req-2", title: "Recruitment Admin", department: "HRGA", waitingOn: "Nabil" },
  { id: "req-3", title: "Graphic Designer", department: "Marketing", waitingOn: "Alya" },
];

export const recentActivity = [
  { title: "Requisition submitted", detail: "Warehouse Supervisor", time: "2 hours ago", tone: "accent" },
  { title: "Approval recorded", detail: "Recruitment Admin", time: "5 hours ago", tone: "success" },
  { title: "Candidate added", detail: "Aisyah Putri", time: "Yesterday", tone: "info" },
  { title: "Folder created", detail: "Warehouse Supervisor", time: "Yesterday", tone: "primary" },
];

export const candidateIntakeMonths = [
  { label: "Apr", value: 48 },
  { label: "May", value: 60 },
  { label: "Jun", value: 54 },
  { label: "Jul", value: 67 },
  { label: "Aug", value: 72 },
  { label: "Sep", value: 86 },
];

export const candidateComposition = [
  { label: "Full-time", pct: 55, tone: "primary" },
  { label: "Daily Worker", pct: 25, tone: "accent" },
  { label: "Other", pct: 20, tone: "success" },
];

export const automatedFolders = [
  {
    position: "Warehouse Supervisor",
    stages: [
      { stage: "Applied", count: 14 },
      { stage: "Screening", count: 6 },
    ],
  },
  {
    position: "Recruitment Admin",
    stages: [
      { stage: "Applied", count: 9 },
      { stage: "Screening", count: 3 },
    ],
  },
  {
    position: "Graphic Designer",
    stages: [{ stage: "Applied", count: 6 }],
  },
];

export const sprintModules = [
  { code: "FR-01", label: "Candidate Database", active: true },
  { code: "FR-03", label: "Job Requisition", active: true },
  { code: null, label: "Workforce Planning", active: false },
  { code: null, label: "Candidate Pipeline", active: false },
  { code: null, label: "Interview Scheduling", active: false },
];
