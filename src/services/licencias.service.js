const db = require("../database/mysql");
const { hashMachine } = require("../utils/machine");
const { generateToken, tokenExpiration } = require("../utils/token");

// ✅ Función para convertir a hora local
function toLocalTime(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);
}

async function createLicense({
  cliente_id,
  licencia_codigo,
  machine_id,
  meses = 1,
}) {
  const machineHash = hashMachine(machine_id);

  const fechaExp = new Date();
  fechaExp.setMonth(fechaExp.getMonth() + meses);

  // ✅ Convertir a hora local
  const fechaExpLocal = toLocalTime(fechaExp);

  await db.execute(
    `INSERT INTO licencias (
      cliente_id,
      licencia_codigo,
      machine_id_hash,
      activa,
      fecha_expiracion
    ) VALUES (?, ?, ?, 1, ?)`,
    [cliente_id, licencia_codigo, machineHash, fechaExpLocal],
  );

  return { ok: true };
}

async function verifyLicense({ licencia_codigo, machine_id }) {
  const machineHash = hashMachine(machine_id);

  const [rows] = await db.execute(
    `SELECT * FROM licencias WHERE licencia_codigo = ?`,
    [licencia_codigo],
  );

  if (!rows.length) throw new Error("LICENCIA_NO_EXISTE");

  const lic = rows[0];

  if (!lic.activa) throw new Error("LICENCIA_INACTIVA");
  if (new Date(lic.fecha_expiracion) < new Date())
    throw new Error("LICENCIA_EXPIRADA");

  if (lic.machine_id_hash !== machineHash)
    throw new Error("MAQUINA_NO_AUTORIZADA");

  const token = generateToken();
  const tokenExp = tokenExpiration(30);

  // ✅ Convertir todas las fechas a hora local
  const ahoraLocal = toLocalTime(new Date());
  const tokenExpLocal = toLocalTime(tokenExp);

  await db.execute(
    `UPDATE licencias
     SET token_actual = ?, 
         token_expira = ?, 
         ultima_verificacion = ?,
         actualizado_en = ?
     WHERE id = ?`,
    [token, tokenExpLocal, ahoraLocal, ahoraLocal, lic.id],
  );

  return {
    token,
    tokenExpira: tokenExpLocal,
  };
}

module.exports = { createLicense, verifyLicense };
