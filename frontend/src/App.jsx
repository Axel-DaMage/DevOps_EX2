import { useEffect, useState } from "react";
import { api } from "./api";

const emptyItem = {
  name: "",
  category: "",
  stock: 0,
  minimum_stock: 1,
  location: ""
};

const emptyTicket = {
  title: "",
  description: "",
  priority: "media",
  status: "abierto",
  related_item_id: ""
};

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [items, setItems] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [ticketForm, setTicketForm] = useState(emptyTicket);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [dashboardData, itemsData, ticketsData] = await Promise.all([
        api.getDashboard(),
        api.getItems(),
        api.getTickets()
      ]);
      setDashboard(dashboardData);
      setItems(itemsData);
      setTickets(ticketsData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function resetMessages() {
    setMessage("");
    setError("");
  }

  async function handleItemSubmit(event) {
    event.preventDefault();
    resetMessages();

    try {
      const payload = {
        ...itemForm,
        stock: Number(itemForm.stock),
        minimum_stock: Number(itemForm.minimum_stock)
      };

      if (editingItemId) {
        await api.updateItem(editingItemId, payload);
        setMessage("Producto actualizado correctamente.");
      } else {
        await api.createItem(payload);
        setMessage("Producto creado correctamente.");
      }

      setItemForm(emptyItem);
      setEditingItemId(null);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleTicketSubmit(event) {
    event.preventDefault();
    resetMessages();

    try {
      const payload = {
        ...ticketForm,
        related_item_id: ticketForm.related_item_id
          ? Number(ticketForm.related_item_id)
          : null
      };

      if (editingTicketId) {
        await api.updateTicket(editingTicketId, payload);
        setMessage("Ticket actualizado correctamente.");
      } else {
        await api.createTicket(payload);
        setMessage("Ticket creado correctamente.");
      }

      setTicketForm(emptyTicket);
      setEditingTicketId(null);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function editItem(item) {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      category: item.category,
      stock: item.stock,
      minimum_stock: item.minimum_stock,
      location: item.location
    });
    resetMessages();
  }

  function editTicket(ticket) {
    setEditingTicketId(ticket.id);
    setTicketForm({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      related_item_id: ticket.related_item_id || ""
    });
    resetMessages();
  }

  async function removeItem(id) {
    resetMessages();
    try {
      await api.deleteItem(id);
      setMessage("Producto eliminado correctamente.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeTicket(id) {
    resetMessages();
    try {
      await api.deleteTicket(id);
      setMessage("Ticket eliminado correctamente.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) {
    return <div className="loading">Cargando panel operativo...</div>;
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Innovatech Chile</p>
          <h1>Inventory Desk</h1>
          <p className="subtitle">
            Panel interno para inventario y tickets de soporte.
          </p>
        </div>
        <div className="hero-note">
          <span>Arquitectura esperada</span>
          <strong>Frontend publico + Backend privado + MySQL privado</strong>
        </div>
      </section>

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <section className="metrics">
        <MetricCard label="Productos" value={dashboard?.totalItems ?? 0} />
        <MetricCard label="Stock bajo" value={dashboard?.lowStockItems ?? 0} />
        <MetricCard label="Tickets" value={dashboard?.totalTickets ?? 0} />
        <MetricCard label="Tickets abiertos" value={dashboard?.openTickets ?? 0} />
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Inventario</h2>
            <p>CRUD simple de productos internos.</p>
          </div>

          <form className="form" onSubmit={handleItemSubmit}>
            <input
              value={itemForm.name}
              onChange={(event) => setItemForm({ ...itemForm, name: event.target.value })}
              placeholder="Nombre del producto"
              required
            />
            <input
              value={itemForm.category}
              onChange={(event) => setItemForm({ ...itemForm, category: event.target.value })}
              placeholder="Categoria"
              required
            />
            <input
              type="number"
              min="0"
              value={itemForm.stock}
              onChange={(event) => setItemForm({ ...itemForm, stock: event.target.value })}
              placeholder="Stock actual"
              required
            />
            <input
              type="number"
              min="1"
              value={itemForm.minimum_stock}
              onChange={(event) => setItemForm({ ...itemForm, minimum_stock: event.target.value })}
              placeholder="Stock minimo"
              required
            />
            <input
              value={itemForm.location}
              onChange={(event) => setItemForm({ ...itemForm, location: event.target.value })}
              placeholder="Ubicacion"
              required
            />
            <div className="actions">
              <button type="submit">
                {editingItemId ? "Actualizar producto" : "Agregar producto"}
              </button>
              {editingItemId ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditingItemId(null);
                    setItemForm(emptyItem);
                  }}
                >
                  Cancelar edicion
                </button>
              ) : null}
            </div>
          </form>

          <div className="table-list">
            {items.map((item) => (
              <article
                key={item.id}
                className={`list-card ${item.stock <= item.minimum_stock ? "warning" : ""}`}
              >
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.category} | {item.location}
                  </p>
                  <small>
                    Stock: {item.stock} | Minimo: {item.minimum_stock}
                  </small>
                </div>
                <div className="card-actions">
                  <button type="button" onClick={() => editItem(item)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => removeItem(item.id)}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Tickets</h2>
            <p>Seguimiento de incidencias operativas.</p>
          </div>

          <form className="form" onSubmit={handleTicketSubmit}>
            <input
              value={ticketForm.title}
              onChange={(event) => setTicketForm({ ...ticketForm, title: event.target.value })}
              placeholder="Titulo del ticket"
              required
            />
            <textarea
              value={ticketForm.description}
              onChange={(event) =>
                setTicketForm({ ...ticketForm, description: event.target.value })
              }
              placeholder="Descripcion"
              rows="4"
              required
            />
            <select
              value={ticketForm.priority}
              onChange={(event) => setTicketForm({ ...ticketForm, priority: event.target.value })}
            >
              <option value="baja">Prioridad baja</option>
              <option value="media">Prioridad media</option>
              <option value="alta">Prioridad alta</option>
            </select>
            <select
              value={ticketForm.status}
              onChange={(event) => setTicketForm({ ...ticketForm, status: event.target.value })}
            >
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En proceso</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <select
              value={ticketForm.related_item_id}
              onChange={(event) =>
                setTicketForm({ ...ticketForm, related_item_id: event.target.value })
              }
            >
              <option value="">Sin producto asociado</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="actions">
              <button type="submit">
                {editingTicketId ? "Actualizar ticket" : "Crear ticket"}
              </button>
              {editingTicketId ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditingTicketId(null);
                    setTicketForm(emptyTicket);
                  }}
                >
                  Cancelar edicion
                </button>
              ) : null}
            </div>
          </form>

          <div className="table-list">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="list-card">
                <div>
                  <h3>{ticket.title}</h3>
                  <p>{ticket.description}</p>
                  <small>
                    Prioridad: {ticket.priority} | Estado: {ticket.status}
                  </small>
                  <br />
                  <small>Producto relacionado: {ticket.related_item_name || "N/A"}</small>
                </div>
                <div className="card-actions">
                  <button type="button" onClick={() => editTicket(ticket)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeTicket(ticket.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default App;
