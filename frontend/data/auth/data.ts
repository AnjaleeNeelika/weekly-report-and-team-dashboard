import { api } from "@/lib/api";

export interface AuthResponseData {
  access_token?: string;
  token_type?: string;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  has_initial_password_changed?: boolean;
  message: string;
}

export const loginUser = async (email: string, password: string): Promise<AuthResponseData> => {
  return api.post<AuthResponseData>("/auth/login", { email, password });
};

export const authApi = {
  login: loginUser,

  me: () => api.get<AuthResponseData>("/auth/me"),

  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: "manager" | "team_member" | "admin";
  }) => api.post<AuthResponseData>("/auth/register", userData),

  changePassword: (data: { email: string; current_password: string; new_password: string }) =>
    api.post<{ message: string }>("/auth/change-password", data),

  logout: () => api.post<{ message: string }>("/auth/logout"),
};
