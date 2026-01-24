const db = require("../database/mysql");
const { hashMachine } = require("../utils/machine");
const { generateToken, tokenExpiration } = require("../utils/token");

// ✅ Forzar hora Colombia (UTC-5)
function toColombiaTime(date) {
  const colombiaOffset = 5 * 60;
  return new Date(date.getTime() - colombiaOffset * 60000)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);
}

// ✅ Obtener hora actual de Colombia (para comparaciones)
function getNowColombia() {
  return new Date(Date.now() - 5 * 60 * 60 * 1000);
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

  const fechaExpLocal = toColombiaTime(fechaExp);

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
  
  // ✅ CORREGIDO: Comparar ambas fechas en hora Colombia
  const fechaExpiracion = new Date(lic.fecha_expiracion);
  const ahoraColombia = getNowColombia();
  
  if (fechaExpiracion < ahoraColombia) {
    throw new Error("LICENCIA_EXPIRADA");
  }

  if (lic.machine_id_hash !== machineHash)
    throw new Error("MAQUINA_NO_AUTORIZADA");

  const token = generateToken();
  const tokenExp = tokenExpiration(30);

  const ahoraLocal = toColombiaTime(new Date());
  const tokenExpLocal = toColombiaTime(tokenExp);

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