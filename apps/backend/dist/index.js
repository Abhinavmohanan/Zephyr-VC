"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuidv4_1 = require("uuidv4");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = require("http").createServer(app);
const socket_io_1 = require("socket.io");
const io = new socket_io_1.Server(server);
require("dotenv").config();
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const port = process.env.BACKEND_PORT;
app.get("/meet/create", (req, res) => {
    res.status(200).send({ meetId: (0, uuidv4_1.uuid)() });
});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
