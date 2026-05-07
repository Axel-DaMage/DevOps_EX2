INSERT INTO inventory_items (name, category, stock, location, minimum_stock) VALUES
  ('Notebook Dell Latitude 5420', 'Computacion', 12, 'Bodega TI - Rack A', 5),
  ('Mouse Logitech M185', 'Perifericos', 30, 'Bodega TI - Rack B', 10),
  ('Switch Cisco 24p', 'Redes', 3, 'Sala de Redes', 2),
  ('Monitor Samsung 24"', 'Monitores', 8, 'Bodega TI - Rack C', 4);

INSERT INTO support_tickets (title, description, priority, status, related_item_id) VALUES
  ('Reposicion de mouses', 'Se requiere reponer perifericos para laboratorio.', 'media', 'abierto', 2),
  ('Stock critico de switches', 'Queda poco stock para recambio de red.', 'alta', 'en_proceso', 3),
  ('Revision de notebooks entregados', 'Validar inventario previo a asignacion de equipos.', 'baja', 'abierto', 1);
