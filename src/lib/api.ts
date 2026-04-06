const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://dukaflow.wikiteq.co.ke/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("shop_token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = this.getToken();
    const activeShopId = localStorage.getItem("active_shop_id");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (activeShopId) headers["X-Shop-Id"] = activeShopId;
    return headers;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers || {}) },
    };

    try {
      const response = await fetch(url, config);
      if (response.status === 401) {
        localStorage.removeItem("shop_token");
        localStorage.removeItem("shop_user");
        localStorage.removeItem("shop_authenticated");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "Network error. Please check your connection and ensure the backend is running.",
        );
      }
      throw error;
    }
  }

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params).filter(
            ([, v]) => v !== undefined && v !== null && v !== "",
          ),
        ).toString()
      : "";
    return this.request<T>(`${endpoint}${queryString}`);
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
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);

// ── Auth API ──
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
};

// ── Products API ──
export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
  }) => api.get("/products", params),
  getById: (id: number) => api.get(`/products/${id}`),
  getByBarcode: (barcode: string) => api.get(`/products/barcode/${barcode}`),
  create: (data: any) => api.post("/products", data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  adjustStock: (id: number, adjustment: number, reason?: string) =>
    api.patch(`/products/${id}/stock`, { adjustment, reason }),
  getLowStock: () => api.get("/products/low-stock"),
};

// ── Customers API ──
export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/customers", params),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post("/customers", data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

// ── Suppliers API ──
export const suppliersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/suppliers", params),
  getById: (id: number) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post("/suppliers", data),
  update: (id: number, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// ── Categories API ──
export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post("/categories", data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// ── Sales API ──
export const salesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }) => api.get("/sales", params),
  getById: (id: number) => api.get(`/sales/${id}`),
  create: (data: {
    items: any[];
    customer_id?: number;
    payment_method?: string;
  }) => api.post("/sales", data),
  todaySummary: () => api.get("/sales/today-summary"),
  getReports: (params?: { from?: string; to?: string }) =>
    api.get("/sales/reports", params),
};

// ── Expenses API ──
export const expensesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }) => api.get("/expenses", params),
  getById: (id: number) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post("/expenses", data),
  update: (id: number, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

// ── Dashboard API ──
export const dashboardApi = {
  getSummary: () => api.get("/dashboard/summary"),
};

// ── Users API ──
export const usersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) => api.get("/users", params),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => api.post("/users", data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  deactivate: (id: number) => api.delete(`/users/${id}`),
};

// ── Audit Logs API ──
export const auditLogsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    user_id?: number;
    action?: string;
    entity?: string;
    from?: string;
    to?: string;
  }) => api.get("/audit-logs", params),
};

// ── M-Pesa API ──
export const mpesaApi = {
  stkPush: (data: { phone: string; amount: number; accountReference?: string }) => api.post("/mpesa/stk-push", data),
  stkQuery: (checkoutRequestID: string) => api.post("/mpesa/stk-query", { checkoutRequestID }),
};

// ── Notifications API ──
export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number; unread_only?: string }) => api.get("/notifications", params),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  dismiss: (id: number) => api.delete(`/notifications/${id}`),
};

// ── Shop Settings API ──
export const shopSettingsApi = {
  get: () => api.get("/shop-settings"),
  update: (data: any) => api.put("/shop-settings", data),
};

// ── Shops API (Multi-tenancy) ──
export const shopsApi = {
  getMyShops: () => api.get("/shops"),
  getById: (id: number) => api.get(`/shops/${id}`),
  create: (data: any) => api.post("/shops", data),
  update: (id: number, data: any) => api.put(`/shops/${id}`, data),
  getMembers: (id: number) => api.get(`/shops/${id}/members`),
  addMember: (id: number, user_id: number, role: string) => api.post(`/shops/${id}/members`, { user_id, role }),
  removeMember: (shopId: number, userId: number) => api.delete(`/shops/${shopId}/members/${userId}`),
};

// ── Subscriptions API ──
export const subscriptionsApi = {
  getMy: () => api.get("/subscriptions/me"),
  getPlans: () => api.get("/subscriptions/plans"),
  renew: (plan_id: string) => api.post("/subscriptions/renew", { plan_id }),
  initiatePayment: (data: { plan_id: string; phone: string }) => api.post("/subscriptions/initiate-payment", data),
  confirmPayment: (data: { checkout_request_id: string; plan_id: string }) => api.post("/subscriptions/confirm-payment", data),
};
