"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
const port = process.env.BACKEND_PORT;
app.get("/", (req, res) => {
    console.log("Hello World");
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
