const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Requisition = {
  id: string;
  position_title: string;
  department_id: string;
  quantity: number;
  status: string;
  created_at: string;
  // Display-only fields — optional so a real API response without them still fits.
  salary_range?: string;
  created_by?: string;
};

export type Candidate = {
  id: string;
  full_name: string;
  email: string;
  folder_path: string;
  applied_at: string;
  // Display-only fields — optional so a real API response without them still fits.
  applicant_type?: string;
  position_title?: string;
  stage?: string;
  phone?: string;
  experience?: string;
  cv_file?: string;
  possible_duplicate?: boolean;
};

async function apiGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json();
}

export const listRequisitions = () => apiGet<Requisition>("/api/v1/requisitions");
export const searchCandidates = (query = "") =>
  apiGet<Candidate>(`/api/v1/candidates/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
