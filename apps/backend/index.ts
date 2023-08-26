import { Socket } from "socket.io";
import { uuid } from "uuidv4";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "types/types";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const server = require("http").createServer(app);
import { Server } from "socket.io";

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

require("dotenv").config();

type Room = {
  users: string[];
};

const rooms = new Map<string, Room>();

io.on("connection", (socket) => {
  console.log("A user connected " + socket.id);

  socket.on("join-room", (roomId, userId, callback) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [userId] });
    } else {
      if (rooms.get(roomId)?.users.length === 2) {
        callback({
          status: "error",
          message: "Room is full",
          secondarySocketId: null,
        });
        return;
      }
      rooms.get(roomId)?.users.push(userId);
    }
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.broadcast.to(roomId).emit("user-joined", { socketId: socket.id });
    callback({
      status: "success",
      message: "Joined room " + roomId,
      secondarySocketId: rooms.get(roomId)?.users[0] ?? null,
    });
  });

  socket.on("disconnect", () => {
    const index = rooms.get(socket.data.roomId)?.users.indexOf(socket.id);
    if (index !== undefined) {
      rooms.get(socket.data.roomId)?.users.splice(index);
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

app.use(cors());
app.use(bodyParser.json());

const port = process.env.BACKEND_PORT || 3000;

const generateId = () => {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMPNOPQRSTUVWXYZ123456789";
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
