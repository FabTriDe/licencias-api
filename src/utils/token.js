const crypto = require("crypto");

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function tokenExpiration(days = 1) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

module.exports = { generateToken, tokenExpiration };
