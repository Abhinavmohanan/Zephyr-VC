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
>(server);

require("dotenv").config();

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(cors());
app.use(bodyParser.json());

const port = process.env.BACKEND_PORT;

app.get("/meet/create", (req, res) => {
  res.status(200).send({ meetId: uuid() });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
