"use strict";
const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.BACKEND_PORT;
app.get("/", (req, res) => {
    console.log("Hello World");
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
