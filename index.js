require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./src/database/mysql");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/clients", require("./src/routes/clientes.router"));
app.use("/licenses", require("./src/routes/licencias.routes"));

app.get("/", (_, res) => res.json({ status: "Licensing API running OK" }));

app.listen(process.env.PORT || 3000, () =>
  console.log("🚀 Licensing API running")
);
