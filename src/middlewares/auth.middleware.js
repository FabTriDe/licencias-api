const pool = require("../database/mysql");

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "TOKEN_REQUERIDO" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const [rows] = await pool.query(
      `
      SELECT id, activa, token_expira
      FROM licencias
      WHERE token_actual = ?
      LIMIT 1
      `,
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "TOKEN_INVALIDO" });
    }

    const licencia = rows[0];

    if (!licencia.activa) {
      return res.status(403).json({ error: "LICENCIA_INACTIVA" });
    }

    if (
      !licencia.token_expira ||
      new Date(licencia.token_expira) < new Date()
    ) {
      return res.status(403).json({ error: "TOKEN_EXPIRADO" });
    }

    // ✔️ Guardamos info mínima por si luego la necesitas
    req.licenciaId = licencia.id;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "ERROR_AUTENTICACION" });
  }
};
