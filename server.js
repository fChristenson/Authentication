const app = require("./src/app");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/auth");

app.listen(3000);
