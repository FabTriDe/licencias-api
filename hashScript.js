// GENERADOR DE HASH PARA LICENCIAS

// Usa este script para generar el machine_id_hash correcto antes de insertar una licencia en la BD

const crypto = require("crypto");
require("dotenv").config(); // Para leer el .env

// Lee el SECRET desde .env (el mismo que usa la API)
const SECRET = process.env.MACHINE_SECRET;

if (!SECRET) {
  console.error("❌ ERROR: MACHINE_SECRET no está definido en .env");
  process.exit(1);
}

// Obtener UUID desde argumentos de línea de comandos
const machineId = process.argv[2];

if (!machineId) {
  console.error("❌ Uso: node hashGenerator.js <UUID_DEL_CLIENTE>");
  console.error("");
  console.error("Ejemplo:");
  console.error("  node hashGenerator.js 03000200-0400-0500-0006-000700080009");
  console.error("");
  process.exit(1);
}

// Generar hash usando HMAC-SHA256 (IGUAL que utils/machine.js)
function hashMachine(uuid) {
  return crypto.createHmac("sha256", SECRET).update(uuid).digest("hex");
}

const hash = hashMachine(machineId);

console.log("");
console.log("═══════════════════════════════════════════════════════════════");
console.log("  🔐 GENERADOR DE HASH PARA LICENCIAS");
console.log("═══════════════════════════════════════════════════════════════");
console.log("");
console.log("📥 UUID recibido del cliente:");
console.log("   ", machineId);
console.log("");
console.log("🔐 HASH generado (HMAC-SHA256 con SECRET):");
console.log("   ", hash);
console.log("");
console.log("📋 Copia este hash para insertar en la BD:");
console.log("");
console.log(`   '${hash}'`);
console.log("");

// Verificación
if (hash.length !== 64) {
  console.warn(
    "⚠️  ADVERTENCIA: El hash debería tener 64 caracteres (tiene " +
      hash.length +
      ")",
  );
}
