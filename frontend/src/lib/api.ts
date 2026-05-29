import client from "../api/client";

export const API_BASE_URL = "";
export const api = client;

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export interface AuthUser {
  id?: string | number;
  user_id?: string | number;
  email: string;
  role: string;
  full_name?: string;
}

export const verifySession = async (): Promise<AuthUser> => {
  const { data } = await api.get<AuthUser>("/api/v1/auth/me");
  return data;
};

export const verifyToken = async (token: string): Promise<AuthUser> => {
  const { data } = await api.get<AuthUser>("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export interface Alumni {
  id: number;
  full_name: string;
  email: string;
  company?: string;
  company_type?: string;
  designation?: string;
  linkedin_url?: string;
  graduation_year: number;
  skills?: string;
  invited_by_admin?: boolean;
}

export type NewAlumni = Omit<Alumni, "id" | "invited_by_admin">;

export const fetchAllAlumni = async (): Promise<Alumni[]> => {
  const { data } = await api.get<Alumni[]>("/alumni/");
  return data;
};

export const fetchAlumniCount = async (): Promise<number> => {
  const { data } = await api.get<{ total_alumni: number } | number>("/alumni/count");
  if (typeof data === "number") return data;
  // @ts-ignore - handling backend object response
  return data.total_alumni ?? data.count ?? 0;
};

export const addAlumni = async (payload: NewAlumni): Promise<Alumni> => {
  const { data } = await api.post<Alumni>("/alumni/add", payload);
  return data;
};

export const inviteAlumni = async (email: string): Promise<{message: string}> => {
  const { data } = await api.post<{message: string}>("/alumni/invite", { email });
  return data;
};

export const deleteAlumni = async (id: number): Promise<{message: string}> => {
  const { data } = await api.delete<{message: string}>(`/alumni/${id}`);
  return data;
};

export interface AnalyticsData {
  name: string;
  value: number;
}

export const fetchAlumniPerCompany = async (): Promise<AnalyticsData[]> => {
  const { data } = await api.get<AnalyticsData[]>("/alumni/analytics/company");
  return data;
};

export const fetchAlumniPerYear = async (): Promise<AnalyticsData[]> => {
  const { data } = await api.get<AnalyticsData[]>("/alumni/analytics/year");
  return data;
};

export const updateAlumni = async (id: number, payload: NewAlumni): Promise<Alumni> => {
  const { data } = await api.put<Alumni>(`/alumni/${id}`, payload);
  return data;
};

export const broadcastNotification = async (payload: {
  event_type: string;
  title: string;
  message: string;
  recipient_roles?: string[];
  recipient_emails?: string[];
  delivery_modes?: string[];
  department?: string;
  api_key?: string;
  module_name?: string;
}): Promise<{message: string}> => {
  const { data } = await api.post<{message: string}>("/notifications/broadcast", payload);
  return data;
};
