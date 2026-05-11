import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "http://54.146.27.167";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", async (_request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch (_error) {
    response.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.get("/api/dashboard", async (_request, response, next) => {
  try {
    const [[itemTotals]] = await pool.query(
      `
        SELECT
          COUNT(*) AS totalItems,
          SUM(CASE WHEN stock <= minimum_stock THEN 1 ELSE 0 END) AS lowStockItems
        FROM inventory_items
      `
    );

    const [[ticketTotals]] = await pool.query(
      `
        SELECT
          COUNT(*) AS totalTickets,
          SUM(CASE WHEN status <> 'cerrado' THEN 1 ELSE 0 END) AS openTickets
        FROM support_tickets
      `
    );

    response.json({
      totalItems: Number(itemTotals.totalItems || 0),
      lowStockItems: Number(itemTotals.lowStockItems || 0),
      totalTickets: Number(ticketTotals.totalTickets || 0),
      openTickets: Number(ticketTotals.openTickets || 0)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/items", async (_request, response, next) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT id, name, category, stock, location, minimum_stock, created_at, updated_at
        FROM inventory_items
        ORDER BY id DESC
      `
    );
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/items", async (request, response, next) => {
  try {
    const { name, category, stock, location, minimum_stock } = request.body;

    if (!name || !category || stock === undefined || !location || !minimum_stock) {
      return response.status(400).json({ message: "Faltan datos obligatorios del producto." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO inventory_items (name, category, stock, location, minimum_stock)
        VALUES (?, ?, ?, ?, ?)
      `,
      [name, category, stock, location, minimum_stock]
    );

    const [[createdItem]] = await pool.query(
      "SELECT id, name, category, stock, location, minimum_stock, created_at, updated_at FROM inventory_items WHERE id = ?",
      [result.insertId]
    );

    response.status(201).json(createdItem);
  } catch (error) {
    next(error);
  }
});

app.put("/api/items/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const { name, category, stock, location, minimum_stock } = request.body;

    const [result] = await pool.query(
      `
        UPDATE inventory_items
        SET name = ?, category = ?, stock = ?, location = ?, minimum_stock = ?
        WHERE id = ?
      `,
      [name, category, stock, location, minimum_stock, id]
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Producto no encontrado." });
    }

    const [[updatedItem]] = await pool.query(
      "SELECT id, name, category, stock, location, minimum_stock, created_at, updated_at FROM inventory_items WHERE id = ?",
      [id]
    );

    response.json(updatedItem);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/items/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const [result] = await pool.query("DELETE FROM inventory_items WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Producto no encontrado." });
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/tickets", async (_request, response, next) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          st.id,
          st.title,
          st.description,
          st.priority,
          st.status,
          st.related_item_id,
          ii.name AS related_item_name,
          st.created_at,
          st.updated_at
        FROM support_tickets st
        LEFT JOIN inventory_items ii ON ii.id = st.related_item_id
        ORDER BY st.id DESC
      `
    );
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/tickets", async (request, response, next) => {
  try {
    const { title, description, priority, status, related_item_id } = request.body;

    if (!title || !description || !priority || !status) {
      return response.status(400).json({ message: "Faltan datos obligatorios del ticket." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO support_tickets (title, description, priority, status, related_item_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      [title, description, priority, status, related_item_id || null]
    );

    const [[createdTicket]] = await pool.query(
      `
        SELECT
          st.id,
          st.title,
          st.description,
          st.priority,
          st.status,
          st.related_item_id,
          ii.name AS related_item_name,
          st.created_at,
          st.updated_at
        FROM support_tickets st
        LEFT JOIN inventory_items ii ON ii.id = st.related_item_id
        WHERE st.id = ?
      `,
      [result.insertId]
    );

    response.status(201).json(createdTicket);
  } catch (error) {
    next(error);
  }
});

app.put("/api/tickets/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const { title, description, priority, status, related_item_id } = request.body;

    const [result] = await pool.query(
      `
        UPDATE support_tickets
        SET title = ?, description = ?, priority = ?, status = ?, related_item_id = ?
        WHERE id = ?
      `,
      [title, description, priority, status, related_item_id || null, id]
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Ticket no encontrado." });
    }

    const [[updatedTicket]] = await pool.query(
      `
        SELECT
          st.id,
          st.title,
          st.description,
          st.priority,
          st.status,
          st.related_item_id,
          ii.name AS related_item_name,
          st.created_at,
          st.updated_at
        FROM support_tickets st
        LEFT JOIN inventory_items ii ON ii.id = st.related_item_id
        WHERE st.id = ?
      `,
      [id]
    );

    response.json(updatedTicket);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tickets/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const [result] = await pool.query("DELETE FROM support_tickets WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Ticket no encontrado." });
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    message: "Ocurrio un error interno en la API."
  });
});

export default app;
