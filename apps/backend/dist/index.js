"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = require("http").createServer(app);
const socket_io_1 = require("socket.io");
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
require("dotenv").config();
const rooms = new Map();
io.on("connection", (socket) => {
    console.log("A user connected " + socket.id);
    socket.on("join-room", (roomId, userId, callback) => {
        var _a, _b, _c, _d;
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { users: [userId] });
        }
        else {
            if (((_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.users.length) === 2) {
                callback({
                    status: "error",
                    message: "Room is full",
                    secondarySocketId: null,
                });
                return;
            }
            (_b = rooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.users.push(userId);
        }
        socket.join(roomId);
        socket.data.roomId = roomId;
        console.log("Joined room " + roomId);
        socket.broadcast.to(roomId).emit("user-joined", { socketId: socket.id });
        callback({
            status: "success",
            message: "Joined room " + roomId,
            secondarySocketId: (_d = (_c = rooms.get(roomId)) === null || _c === void 0 ? void 0 : _c.users[1]) !== null && _d !== void 0 ? _d : null,
        });
    });
    socket.on("disconnect", () => {
        var _a, _b;
        const index = (_a = rooms.get(socket.data.roomId)) === null || _a === void 0 ? void 0 : _a.users.indexOf(socket.id);
        if (index !== undefined) {
            (_b = rooms.get(socket.data.roomId)) === null || _b === void 0 ? void 0 : _b.users.splice(index);
            socket.broadcast
                .to(socket.data.roomId)
                .emit("user-left", { socketId: socket.id });
        }
    });
    socket.on("user-joined", (payload) => {
        socket.broadcast
            .to(payload.target)
            .emit("user-joined", { socketId: payload.socketId });
    });
    socket.on("offer", (payload) => {
        console.log("Offer , sending to " + socket.data.roomId);
        socket.broadcast.to(socket.data.roomId).emit("offer", payload);
    });
    socket.on("answer", (payload) => {
        socket.broadcast.to(socket.data.roomId).emit("answer", payload);
    });
    socket.on("candidate", (payload) => {
        socket.broadcast.to(socket.data.roomId).emit("candidate", payload);
    });
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const port = process.env.BACKEND_PORT || 3000;
const generateId = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMPNOPQRSTUVWXYZ123456789";
    let id = "";
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        id += alphabet[randomIndex];
    }
    return id;
};
app.get("/meet/create", (req, res) => {
    //Generate 4 letter id
    res.status(200).send({ meetId: generateId() });
});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
