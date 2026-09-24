export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "jaknot_token";

export type Requisition = {
  id: string;
  position_title: string;
  department_id: string;
  quantity: number;
  justification: string;
  budget_range: string;
  status: string;
  created_by?: string;
  created_by_name: string;
  approved_by_name: string | null;
  created_at: string;
};

export type DuplicateType = "same_position" | "different_position" | null;

export type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cv_file_url: string;
  position_title: string;
  stage: string;
  applicant_type: string;
  duplicate_type: DuplicateType;
  folder_path: string;
  folder_id: string | null;
  applied_at: string;
};

export type Folder = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  candidate_count: number;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

/** Resolves a backend-relative file path (e.g. "/uploads/cv/x.pdf") to a full URL. */
export function resolveFileUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) clearToken();
    let detail = `API request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function login(email: string, password: string): Promise<string> {
  const data = await request<{ access_token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data.access_token;
}

export const getMe = () => request<CurrentUser>("/api/v1/auth/me");

export const listRequisitions = () => request<Requisition[]>("/api/v1/requisitions");

export const createRequisition = (payload: {
  position_title: string;
  department_id: string;
  quantity: number;
  justification: string;
  budget_range: string;
}) =>
  request<Requisition>("/api/v1/requisitions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const approveRequisition = (id: string, decision: "Approved" | "Rejected", reason?: string) =>
  request<Requisition>(`/api/v1/requisitions/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ decision, reason }),
  });

export const searchCandidates = (query = "") =>
  request<Candidate[]>(`/api/v1/candidates/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);

export const intakeCandidate = (payload: {
  full_name: string;
  email: string;
  phone: string;
  cv_file_url: string;
  position_title: string;
  stage?: string;
  applicant_type?: string;
}) =>
  request<Candidate>("/api/v1/candidates/intake", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const assignCandidateFolder = (candidateId: string, folderId: string | null) =>
  request<Candidate>(`/api/v1/candidates/${candidateId}/folder`, {
    method: "PATCH",
    body: JSON.stringify({ folder_id: folderId }),
  });

export const uploadCv = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return request<{ url: string; filename: string }>("/api/v1/uploads/cv", {
    method: "POST",
    body: form,
  });
};

export const listFolders = () => request<Folder[]>("/api/v1/folders");

export const createFolder = (name: string) =>
  request<Folder>("/api/v1/folders", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const renameFolder = (id: string, name: string) =>
  request<Folder>(`/api/v1/folders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });

export const deleteFolder = (id: string) =>
  request<void>(`/api/v1/folders/${id}`, {
    method: "DELETE",
  });
