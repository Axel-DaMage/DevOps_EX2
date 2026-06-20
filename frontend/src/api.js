const API_URL = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "No se pudo completar la solicitud.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getDashboard: () => request("/api/dashboard"),
  getItems: () => request("/api/items"),
  createItem: (data) => request("/api/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/api/items/${id}`, { method: "DELETE" }),
  getTickets: () => request("/api/tickets"),
  createTicket: (data) => request("/api/tickets", { method: "POST", body: JSON.stringify(data) }),
  updateTicket: (id, data) => request(`/api/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTicket: (id) => request(`/api/tickets/${id}`, { method: "DELETE" })
};
