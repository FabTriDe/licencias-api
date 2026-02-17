const licenseService = require("../services/licencias.service");

exports.create = async (req, res) => {
  const { cliente_id, licencia_codigo, machine_id, meses } = req.body;

  if (!cliente_id || !licencia_codigo || !machine_id) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  await licenseService.createLicense({
    cliente_id,
    licencia_codigo,
    machine_id,
    meses,
  });

  res.json({ ok: true });
};

exports.verify = async (req, res) => {
  const { licencia_codigo, machine_id } = req.body;

  if (!licencia_codigo || !machine_id) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const result = await licenseService.verifyLicense({
      licencia_codigo,
      machine_id,
    });

    res.json({
      ok: true,
      token: result.token,
      token_expira: result.tokenExpira,
      estado: result.estado, // ✅ 'activa' o 'en_mora'
    });
  } catch (err) {
    const map = {
      LICENCIA_NO_EXISTE: 403,
      LICENCIA_INACTIVA: 403,
      LICENCIA_EXPIRADA: 403,
      LICENCIA_PENDIENTE_PAGO: 403,
      MAQUINA_NO_AUTORIZADA: 403,
    };

    res.status(map[err.message] || 500).json({
      error: err.message,
    });
  }
};
