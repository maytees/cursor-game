import cors from "cors"; // Add this import
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

type Player = {
  id: string;
  name: string;
  ready: boolean;
};

const activeRooms = new Map<
  string,
  { players: Player[]; full: boolean; host: string }
>();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket: Socket) => {
  console.log(`Socket ${socket.id} connected!`);

  socket.on("createRoom", () => {
    // Generates 6 digit code for room
    const roomCode = generateRoomCode();
    // Sets default values for room (party leader isnt ready, party isnt full)
    activeRooms.set(roomCode, {
      players: [
        { name: "Player" + socket.id.charAt(5), id: socket.id, ready: false },
      ],
      full: false,
      host: socket.id,
    });
    // This is putting the creator into the socketio room
    socket.join(roomCode);
    // Telling the client that the room was created
    socket.emit("roomCreated", roomCode, activeRooms.get(roomCode)?.players);
    // console.log(activeRooms.get(roomCode)?.players, " are list");
    // Dont really know what this is...
    // socket.emit("playerJoined", activeRooms.get(roomCode)?.players);
  });

  socket.on("joinRoom", (roomCode: string) => {
    // Getting the room
    const room = activeRooms.get(roomCode);
    if (room && !room.full) {
      // If room is valid and not full...
      room.players.push({
        name: "Player" + socket.id.charAt(5),
        id: socket.id,
        ready: false,
      });
      socket.join(roomCode);
      if (room.players.length === 2) {
        room.full = true;
      }
      // Tell everyone in the socketio room that someone joined
      io.to(roomCode).emit("playerJoined", room.players);
      socket.emit("joinSuccess", room.players);
    } else {
      socket.emit("roomError", "Room not found or full");
    }
  });

  socket.on("setReady", (isReady: boolean) => {
    let roomCode: string | undefined;
    activeRooms.forEach((room, code) => {
      // Find the index of the player in the current room
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);

      // If the player is found in this room
      if (playerIndex !== -1) {
        // Update the player's ready status
        room.players[playerIndex].ready = isReady;
        // Store the room code
        roomCode = code;
      }
    });

    if (roomCode) {
      const room = activeRooms.get(roomCode);
      if (room) {
        // Tell all players the list of players who are ready
        io.to(roomCode).emit("playerReady", room.players);
      }
    }
  });

  socket.on("startGame", (roomCode: string) => {
    const room = activeRooms.get(roomCode);
    // Checks if 1. Room exists 2. "Starter" is the room creator 3. All players are ready
    if (room && room.host === socket.id && room.players.every((p) => p.ready)) {
      io.to(roomCode).emit("gameStart");
      console.log(`${socket.id}: Emitted game start!`);
    } else if (!room) {
      console.error(`${socket.id}: Could not start game!`);
    } else if (room.host !== socket.id) {
      console.error(`${socket.id}: Sender is not room creator!`);
    } else if (room.players.every((p) => !p.ready)) {
      console.error(`${socket.id}: Not everyone is ready!`);
    }
  });

  socket.on("disconnect", () => {
    activeRooms.forEach((room, code) => {
      const index = room.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        room.full = false;
        if (room.players.length === 0) {
          activeRooms.delete(code);
        } else {
          if (room.host === socket.id) {
            room.host = room.players[0].id;
          }
          io.to(code).emit("playerLeft", room.players);
        }
      }
    });
  });
});

app.get("/api/room/:roomCode/players", (req, res) => {
  const { roomCode } = req.params;
  const room = activeRooms.get(roomCode);

  if (room) {
    res.json({ players: room.players });
  } else {
    res.status(404).json({ error: "Room not found" });
  }
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
