const router = require("express").Router();
const controller = require("../controllers/clientes.controller");

router.post("/", controller.create);

module.exports = router;
