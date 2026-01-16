const crypto = require("crypto");

const SECRET = process.env.MACHINE_SECRET;

function hashMachine(machineId) {
  return crypto.createHmac("sha256", SECRET).update(machineId).digest("hex");
}

module.exports = { hashMachine };
