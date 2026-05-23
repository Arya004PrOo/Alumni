import axios from "axios";

export const API_BASE_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Alumni {
  id: number;
  full_name: string;
  email: string;
  company: string;
  designation: string;
  linkedin_url: string;
  graduation_year: number;
  invited_by_admin?: boolean;
}

export type NewAlumni = Omit<Alumni, "id" | "invited_by_admin">;

export const fetchAllAlumni = async (): Promise<Alumni[]> => {
  try {
    const { data } = await api.get<Alumni[]>("/alumni/all");
    return data;
  } catch (error: any) {
    console.error("Error fetching alumni:", error.response?.data || error.message);
    throw new Error("Failed to fetch alumni");
  }
};

export const fetchAlumniCount = async (): Promise<number> => {
  try {
    const { data } = await api.get<{ count: number } | number>("/alumni/count");

    if (typeof data === "number") return data;
    return data.count;
  } catch (error: any) {
    console.error("Error fetching count:", error.response?.data || error.message);
    throw new Error("Failed to fetch count");
  }
};

export const addAlumni = async (payload: NewAlumni): Promise<Alumni> => {
  try {
    const { data } = await api.post<Alumni>("/alumni/add", payload);
    return data;
  } catch (error: any) {
    console.error("Error adding alumni:", error.response?.data || error.message);
    throw new Error("Failed to add alumni");
  }
};