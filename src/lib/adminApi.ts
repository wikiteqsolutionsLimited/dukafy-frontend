const API_BASE_URL =
<<<<<<< HEAD
  import.meta.env.VITE_API_URL || "https://dukafy.wikiteq.co.ke/api";
=======
  import.meta.env.VITE_API_URL || "https://dukaflow.wikiteq.co.ke/api";
>>>>>>> 8831112745dcd872c38f301c814f6d1906d0b0b2

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
<<<<<<< HEAD
  pagination?: { page: number; limit: number; total: number; totalPages: number };
=======
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
>>>>>>> 8831112745dcd872c38f301c814f6d1906d0b0b2
}

class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = localStorage.getItem("dukafy_admin_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

<<<<<<< HEAD
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = { ...options, headers: { ...this.getHeaders(), ...(options.headers || {}) } };
=======
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers || {}) },
    };
>>>>>>> 8831112745dcd872c38f301c814f6d1906d0b0b2
    const response = await fetch(url, config);
    if (response.status === 401) {
      localStorage.removeItem("dukafy_admin_token");
      window.location.href = "/dukafy-admin/login";
      throw new Error("Session expired");
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Request failed`);
    return data;
  }

<<<<<<< HEAD
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const qs = params ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString() : "";
    return this.request<T>(`${endpoint}${qs}`);
  }
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined });
  }
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
=======
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const qs = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params).filter(
            ([, v]) => v !== undefined && v !== null && v !== "",
          ),
        ).toString()
      : "";
    return this.request<T>(`${endpoint}${qs}`);
  }
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
>>>>>>> 8831112745dcd872c38f301c814f6d1906d0b0b2
  }
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

const client = new AdminApiClient(API_BASE_URL);

export const adminApi = {
<<<<<<< HEAD
  login: (email: string, password: string) => client.post("/admin/login", { email, password }),
  me: () => client.get("/admin/me"),
  dashboard: () => client.get("/admin/dashboard"),
  getShops: (params?: Record<string, any>) => client.get("/admin/shops", params),
=======
  login: (email: string, password: string) =>
    client.post("/admin/login", { email, password }),
  me: () => client.get("/admin/me"),
  dashboard: () => client.get("/admin/dashboard"),
  getShops: (params?: Record<string, any>) =>
    client.get("/admin/shops", params),
>>>>>>> 8831112745dcd872c38f301c814f6d1906d0b0b2
  getShop: (id: number) => client.get(`/admin/shops/${id}`),
  updateShop: (id: number, data: any) => client.put(`/admin/shops/${id}`, data),
  disableShop: (id: number) => client.post(`/admin/shops/${id}/disable`),
  enableShop: (id: number) => client.post(`/admin/shops/${id}/enable`),
  onboardShop: (data: any) => client.post("/admin/shops/onboard", data),
<<<<<<< HEAD
  getUsers: (params?: Record<string, any>) => client.get("/admin/users", params),
  updateUser: (id: number, data: any) => client.put(`/admin/users/${id}`, data),
  disableUser: (id: number) => client.post(`/admin/users/${id}/disable`),
  getSubscriptions: (params?: Record<string, any>) => client.get("/admin/subscriptions", params),
  updateSubscription: (id: number, data: any) => client.put(`/admin/subscriptions/${id}`, data),
  getStaff: (params?: Record<string, any>) => client.get("/admin/staff", params),
  createStaff: (data: any) => client.post("/admin/staff", data),
  updateStaff: (id: number, data: any) => client.put(`/admin/staff/${id}`, data),
  deleteStaff: (id: number) => client.delete(`/admin/staff/${id}`),
  getTickets: (params?: Record<string, any>) => client.get("/admin/tickets", params),
  getTicket: (id: number) => client.get(`/admin/tickets/${id}`),
  updateTicket: (id: number, data: any) => client.put(`/admin/tickets/${id}`, data),
  replyToTicket: (id: number, message: string) => client.post(`/admin/tickets/${id}/reply`, { message }),
  sendEmail: (data: { to: string; subject: string; html_content: string }) => client.post("/admin/send-email", data),
  getActivityLog: (params?: Record<string, any>) => client.get("/admin/activity-log", params),
=======
  getUsers: (params?: Record<string, any>) =>
    client.get("/admin/users", params),
  updateUser: (id: number, data: any) => client.put(`/admin/users/${id}`, data),
  disableUser: (id: number) => client.post(`/admin/users/${id}/disable`),
  getSubscriptions: (params?: Record<string, any>) =>
    client.get("/admin/subscriptions", params),
  updateSubscription: (id: number, data: any) =>
    client.put(`/admin/subscriptions/${id}`, data),
  getStaff: (params?: Record<string, any>) =>
    client.get("/admin/staff", params),
  createStaff: (data: any) => client.post("/admin/staff", data),
  updateStaff: (id: number, data: any) =>
    client.put(`/admin/staff/${id}`, data),
  deleteStaff: (id: number) => client.delete(`/admin/staff/${id}`),
  getTickets: (params?: Record<string, any>) =>
    client.get("/admin/tickets", params),
  getTicket: (id: number) => client.get(`/admin/tickets/${id}`),
  updateTicket: (id: number, data: any) =>
    client.put(`/admin/tickets/${id}`, data),
  replyToTicket: (id: number, message: string) =>
    client.post(`/admin/tickets/${id}/reply`, { message }),
  sendEmail: (data: { to: string; subject: string; html_content: string }) =>
    client.post("/admin/send-email", data),
  getActivityLog: (params?: Record<string, any>) =>
    client.get("/admin/activity-log", params),
>>>>>>> 8831112745dcd872c38f301c814f6d1906d0b0b2
};
