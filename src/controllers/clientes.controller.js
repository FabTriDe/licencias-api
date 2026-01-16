const clientService = require("../services/clientes.service");

exports.create = async (req, res) => {
  const { nombre, email, telefono } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const client = await clientService.createClient({
    nombre,
    email,
    telefono,
  });

  res.json(client);
};
