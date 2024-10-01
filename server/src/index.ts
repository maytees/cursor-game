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

const activeRooms = new Map<string, { players: any[]; full: boolean }>();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket: Socket) => {
  console.log(`Socket ${socket.id} connected!`);

  socket.on("createRoom", () => {
    const roomCode = generateRoomCode();
    activeRooms.set(roomCode, {
      players: [{ id: socket.id, ready: false }],
      full: false,
    });
    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
    io.to(roomCode).emit("playerJoined", activeRooms.get(roomCode)?.players);
  });

  socket.on("joinRoom", (roomCode: string) => {
    const room = activeRooms.get(roomCode);
    if (room && !room.full) {
      room.players.push({ id: socket.id, ready: false });
      socket.join(roomCode);
      if (room.players.length === 2) {
        room.full = true;
      }
      io.to(roomCode).emit("playerJoined", room.players);
    } else {
      socket.emit("roomError", "Room not found or full");
    }
  });

  socket.on("setReady", (isReady: boolean) => {
    let roomCode: string | undefined;
    activeRooms.forEach((room, code) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players[playerIndex].ready = isReady;
        roomCode = code;
      }
    });

    if (roomCode) {
      const room = activeRooms.get(roomCode);
      if (room) {
        io.to(roomCode).emit("playerReady", room.players);

        if (room.players.length === 2 && room.players.every(p => p.ready)) {
          io.to(roomCode).emit("gameStart", { players: room.players });
        }
      }
    }
  });

  socket.on("disconnect", () => {
    activeRooms.forEach((room, code) => {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        room.full = false;
        if (room.players.length === 0) {
          activeRooms.delete(code);
        } else {
          io.to(code).emit("playerLeft", room.players);
        }
      }
    });
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
