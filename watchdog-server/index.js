const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log(`a user connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("os_info", (data) => {
    socket.join(data.computerID);
    io.to(data.computerID).emit("os_info", data);
  });

  socket.on("connect_to_room", (data) => {
    console.log(`user connected to room: ${data.computerID}`);
    socket.join(data.computerID);
  });
});

io.on("error", (err) => {
  console.error(err);
});

server.listen(3002, () => {
  console.log("listening on *:3002");
});
