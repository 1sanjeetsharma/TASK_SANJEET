import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login", data),
  me:       ()     => api.get("/auth/me"),
};

// ─── Tasks ─────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll:  (params) => api.get("/tasks", { params }),
  getById: (id)     => api.get(`/tasks/${id}`),
  create:  (data)   => api.post("/tasks", data),
  update:  (id, data) => api.put(`/tasks/${id}`, data),
  delete:  (id)     => api.delete(`/tasks/${id}`),
  stats:   ()       => api.get("/tasks/stats/summary"),
};

export default api;
