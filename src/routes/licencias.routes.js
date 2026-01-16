const router = require("express").Router();
const controller = require("../controllers/licencias.controller");

router.post("/create", controller.create);
router.post("/verify", controller.verify);

module.exports = router;
