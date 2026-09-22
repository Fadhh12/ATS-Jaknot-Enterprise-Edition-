import type { Candidate, Requisition } from "@/lib/api";

// Realistic placeholder data used until the FastAPI backend (see /backend) is
// running and seeded. Swapped out transparently once /api/v1/* responds.

export const dummyRequisitions: Requisition[] = [
  {
    id: "req-1",
    position_title: "Warehouse Staff (Daily Worker)",
    department_id: "Warehouse Operations",
    quantity: 12,
    status: "Pending Approval",
    created_at: "2026-09-19T08:14:00Z",
  },
  {
    id: "req-2",
    position_title: "Inventory Supervisor",
    department_id: "Warehouse Operations",
    quantity: 2,
    status: "Approved",
    created_at: "2026-09-15T03:41:00Z",
  },
  {
    id: "req-3",
    position_title: "Forklift Operator",
    department_id: "Fleet & Logistics",
    quantity: 4,
    status: "Approved",
    created_at: "2026-09-14T10:02:00Z",
  },
  {
    id: "req-4",
    position_title: "HR Generalist",
    department_id: "HRGA",
    quantity: 1,
    status: "Draft",
    created_at: "2026-09-21T13:27:00Z",
  },
  {
    id: "req-5",
    position_title: "Finance Staff (AP/AR)",
    department_id: "Finance & Accounting",
    quantity: 1,
    status: "Rejected",
    created_at: "2026-09-10T06:55:00Z",
  },
  {
    id: "req-6",
    position_title: "Customer Service Officer",
    department_id: "Customer Service",
    quantity: 3,
    status: "Pending Approval",
    created_at: "2026-09-20T11:09:00Z",
  },
  {
    id: "req-7",
    position_title: "IT Support Specialist",
    department_id: "IT & Systems",
    quantity: 1,
    status: "Closed",
    created_at: "2026-08-29T09:18:00Z",
  },
  {
    id: "req-8",
    position_title: "Picker & Packer (Daily Worker)",
    department_id: "Warehouse Operations",
    quantity: 18,
    status: "Approved",
    created_at: "2026-09-17T07:32:00Z",
  },
];

export const dummyCandidates: Candidate[] = [
  {
    id: "cand-1",
    full_name: "Dimas Prasetyo",
    email: "dimas.prasetyo88@gmail.com",
    folder_path: "warehouse-staff-daily-worker/screening/2026-09",
    applied_at: "2026-09-21T14:02:00Z",
  },
  {
    id: "cand-2",
    full_name: "Ayu Lestari",
    email: "ayu.lestari.hr@gmail.com",
    folder_path: "hr-generalist/interview/2026-09",
    applied_at: "2026-09-20T09:47:00Z",
  },
  {
    id: "cand-3",
    full_name: "Rangga Saputra",
    email: "rangga.saputra21@yahoo.com",
    folder_path: "forklift-operator/screening/2026-09",
    applied_at: "2026-09-19T16:23:00Z",
  },
  {
    id: "cand-4",
    full_name: "Nadia Kusuma Wardani",
    email: "nadia.kw@gmail.com",
    folder_path: "customer-service-officer/interview/2026-09",
    applied_at: "2026-09-19T11:05:00Z",
  },
  {
    id: "cand-5",
    full_name: "Bagus Wirawan",
    email: "bagus.wirawan90@gmail.com",
    folder_path: "picker-packer-daily-worker/screening/2026-09",
    applied_at: "2026-09-18T08:41:00Z",
  },
  {
    id: "cand-6",
    full_name: "Siti Rahmawati",
    email: "siti.rahmawati.jkt@gmail.com",
    folder_path: "inventory-supervisor/offer/2026-09",
    applied_at: "2026-09-17T13:58:00Z",
  },
  {
    id: "cand-7",
    full_name: "Fajar Nugroho",
    email: "fajar.nugroho77@gmail.com",
    folder_path: "picker-packer-daily-worker/screening/2026-09",
    applied_at: "2026-09-16T10:12:00Z",
  },
  {
    id: "cand-8",
    full_name: "Melati Anggraini",
    email: "melati.anggraini@gmail.com",
    folder_path: "finance-staff-ap-ar/screening/2026-09",
    applied_at: "2026-09-15T15:30:00Z",
  },
  {
    id: "cand-9",
    full_name: "Yusuf Hidayat",
    email: "yusuf.hidayat.wh@gmail.com",
    folder_path: "warehouse-staff-daily-worker/screening/2026-09",
    applied_at: "2026-09-14T09:04:00Z",
  },
  {
    id: "cand-10",
    full_name: "Putri Ramadhani",
    email: "putri.ramadhani02@gmail.com",
    folder_path: "hr-generalist/screening/2026-09",
    applied_at: "2026-09-12T12:47:00Z",
  },
];

export const pendingApprovals = [
  {
    id: "req-1",
    title: "Warehouse Staff (Daily Worker) × 12",
    department: "Warehouse Operations",
    waitingOn: "Kak Nadira (HR Manager)",
    daysWaiting: 3,
  },
  {
    id: "req-6",
    title: "Customer Service Officer × 3",
    department: "Customer Service",
    waitingOn: "GM Customer Service",
    daysWaiting: 2,
  },
  {
    id: "req-4",
    title: "HR Generalist × 1",
    department: "HRGA",
    waitingOn: "Draft — not submitted",
    daysWaiting: 1,
  },
];

export const recentActivity = [
  { candidate: "Dimas Prasetyo", action: "applied to", target: "Warehouse Staff (Daily Worker)", time: "2 hours ago" },
  { candidate: "Ayu Lestari", action: "moved to interview for", target: "HR Generalist", time: "6 hours ago" },
  { candidate: "Rangga Saputra", action: "applied to", target: "Forklift Operator", time: "1 day ago" },
  { candidate: "Siti Rahmawati", action: "received an offer for", target: "Inventory Supervisor", time: "1 day ago" },
  { candidate: "Fajar Nugroho", action: "applied to", target: "Picker & Packer (Daily Worker)", time: "2 days ago" },
];
