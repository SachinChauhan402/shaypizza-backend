const express = require("express");
var cors = require("cors");

const db = require("./db.js");
const pizzaModel = require("./models/PizzaModels");

const pizzasRoute = require("./routes/PizzasRoute");
const userRoute = require("./routes/userRoute");
const ordersRoute = require("./routes/ordersRoute");

const app = express();
app.use(cors());
app.use(express.json());

db.connect();

app.use("/api/pizzas/", pizzasRoute);
app.use("/api/users/", userRoute);
app.use("/api/orders/", ordersRoute);

app.get("/", (req, res) => {
  res.send("server started");
});

app.get("/getpizzas", (req, res) => {
  pizzaModel.find().then((data) => {
    res.send(data);
  });
});

const port = process.env.PORT || 4000;

app.listen(port, () => `server running on port ${port}`);
