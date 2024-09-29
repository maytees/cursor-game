import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const activeRooms = new Map<string, { players: string[]; full: boolean }>();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket: Socket) => {
  console.log(`Socket ${socket.id} connected!`);

  socket.on("sigma", () => {
    console.log("sigma nation checkkk");
  });

  socket.on("createRoom", () => {
    const roomCode = generateRoomCode();
    activeRooms.set(roomCode, {
      players: [socket.id],
      full: false,
    });
    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
  });

  socket.on("joinRoom", (roomCode: string) => {
    console.log("joined room with code:", roomCode);
    const room = activeRooms.get(roomCode);
    if (room && !room.full) {
      room.players.push(socket.id);
      socket.join(roomCode);
      if (room.players.length === 2) {
        room.full = true;
        io.to(roomCode).emit("gameStart", {
          players: room.players,
        });
      } else {
        socket.emit("waitingForPlayer");
      }
    } else {
      socket.emit("roomError", "Room not found or full");
    }
  });

  socket.on("disconnect", () => {
    activeRooms.forEach((room, code) => {
      const index = room.players.indexOf(socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        room.full = false;
        if (room.players.length === 0) {
          activeRooms.delete(code);
        } else {
          io.to(code).emit("playerLeft");
        }
      }
    });
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
