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
  getDashboard: () => request("/dashboard"),
  getItems: () => request("/items"),
  createItem: (data) => request("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
  getTickets: () => request("/tickets"),
  createTicket: (data) => request("/tickets", { method: "POST", body: JSON.stringify(data) }),
  updateTicket: (id, data) => request(`/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTicket: (id) => request(`/tickets/${id}`, { method: "DELETE" })
};
