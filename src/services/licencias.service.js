const db = require("../database/mysql");
const { hashMachine } = require("../utils/machine");
const { generateToken, tokenExpiration } = require("../utils/token");

// ✅ Función para convertir a hora local (igual que en Electron)
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

  // ✅ Convertir a hora local del servidor
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
  // ... validaciones ...

  const token = generateToken();
  const tokenExp = tokenExpiration(30);

  const ahoraLocal = toLocalTime(new Date()); // ← Hora actual del servidor
  const tokenExpLocal = toLocalTime(tokenExp);

  await db.execute(
    `UPDATE licencias
     SET token_actual = ?, 
         token_expira = ?, 
         ultima_verificacion = ?,
         creado_en = ?,
         actualizado_en = ?  -- ✅ Aquí se actualiza con hora local
     WHERE id = ?`,
    [token, tokenExpLocal, ahoraLocal, ahoraLocal, ahoraLocal, lic.id],
    //                                              ↑
    //                           Hora local del dispositivo
  );

  return {
    token,
    tokenExpira: tokenExpLocal,
  };
}

module.exports = { createLicense, verifyLicense };
