const db = require("../database/mysql");

async function createClient({ nombre, email, telefono }) {
  const [result] = await db.execute(
    `INSERT INTO clientes (nombre, email, telefono)
     VALUES (?, ?, ?)`,
    [nombre, email, telefono]
  );

  return {
    id: result.insertId,
    nombre,
    email,
    telefono,
  };
}

module.exports = { createClient };
