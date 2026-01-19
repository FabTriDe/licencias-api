const db = require("../database/mysql");
const { hashMachine } = require("../utils/machine");
const { generateToken, tokenExpiration } = require("../utils/token");

async function createLicense({
  cliente_id,
  licencia_codigo,
  machine_id,
  meses = 1,
}) {
  const machineHash = hashMachine(machine_id);

  const fechaExp = new Date();
  fechaExp.setMonth(fechaExp.getMonth() + meses);

  await db.execute(
    `INSERT INTO licencias (
      cliente_id,
      licencia_codigo,
      machine_id_hash,
      activa,
      fecha_expiracion
    ) VALUES (?, ?, ?, 1, ?)`,
    [cliente_id, licencia_codigo, machineHash, fechaExp],
  );

  return { ok: true };
}

async function verifyLicense({ licencia_codigo, machine_id }) {
  console.log("🔥 VERIFY LICENSE HIT", {
    licencia_codigo,
    machine_id,
  });

  const machineHash = machine_id;

  const [rows] = await db.execute(
    `SELECT * FROM licencias WHERE licencia_codigo = ?`,
    [licencia_codigo],
  );

  if (!rows.length) throw new Error("LICENCIA_NO_EXISTE");

  const lic = rows[0];

  if (!lic.activa) throw new Error("LICENCIA_INACTIVA");
  if (new Date(lic.fecha_expiracion) < new Date())
    throw new Error("LICENCIA_EXPIRADA");

  console.log("DB HASH:", lic.machine_id_hash);
  console.log("RECIBIDO:", machine_id);

  if (lic.machine_id_hash !== machineHash)
    throw new Error("MAQUINA_NO_AUTORIZADA");

  const token = generateToken();
  const tokenExp = tokenExpiration(30);

  await db.execute(
    `UPDATE licencias
     SET token_actual = ?, token_expira = ?, ultima_verificacion = NOW()
     WHERE id = ?`,
    [token, tokenExp, lic.id],
  );

  return {
    token,
    tokenExpira: tokenExp,
  };
}

module.exports = { createLicense, verifyLicense };
