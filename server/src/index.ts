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

type Player = {
  id: string;
  name: string;
  ready: boolean;
  host: boolean; // Might not be good to define host twice (game and player)
  position: {
    x: number;
    y: number;
  };
  rotation: number;
};

const activeRooms = new Map<
  string,
  { players: Player[]; full: boolean; host: string }
>();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function disconnect(socket: Socket) {
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
}

io.on("connection", (socket: Socket) => {
  console.log(`Socket ${socket.id} connected!`);

  socket.on("createRoom", () => {
    // Generates 6 digit code for room
    const roomCode = generateRoomCode();
    // Sets default values for room (party leader isnt ready, party isnt full)
    activeRooms.set(roomCode, {
      players: [
        {
          name: "Player" + socket.id.charAt(5),
          id: socket.id,
          ready: false,
          host: true,
          position: {
            x: 50,
            y: 50,
          },
          rotation: 0,
        },
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
      // TODO: Add something on every player join or smthn?
      const position = {
        x: 100,
        y: 100,
      };
      room.players.push({
        name: "Player" + socket.id.charAt(5),
        id: socket.id,
        ready: false,
        host: false,
        position,
        rotation: 0,
      });
      socket.join(roomCode);
      if (room.players.length === 2) {
        room.full = true;
      }
      // Tell everyone in the socketio room that someone joined
      io.to(roomCode).emit("playerJoined", room.players, socket.id, position);
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
      socket.broadcast.to(roomCode).emit("gameStart");
      console.log(`${socket.id}: Emitted game start!`);
    } else if (!room) {
      console.error(`${socket.id}: Could not start game!`);
    } else if (room.host !== socket.id) {
      console.error(`${socket.id}: Sender is not room creator!`);
    } else if (room.players.every((p) => !p.ready)) {
      console.error(`${socket.id}: Not everyone is ready!`);
    }
  });
  socket.on(
    "move",
    (x: number, y: number, rotation: number, roomCode: string) => {
      // Find the room with the current socket
      if (!activeRooms.has(roomCode)) {
        socket.emit("error", "Invalid room code! (move)");
        return;
      }

      let entry = activeRooms.get(roomCode);
      if (!entry?.players?.some((player) => player.id === socket.id)) {
        socket.emit("error", "Cannot find player! (move)");
        return;
      }

      let player = entry.players.find((player) => player.id === socket.id)!;
      player.position = { x, y };
      player.rotation = rotation;

      // Update the player in the array
      const playerIndex = entry.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        entry.players[playerIndex] = player;
      }

      activeRooms.set(roomCode, entry);

      // Tell other players in the room that this player moved
      socket.to(roomCode).emit("playerMoved", socket.id, x, y, rotation);
    }
  );

  socket.on("disconnect", () => {
    disconnect(socket);
  });

  socket.on("leave", () => {
    disconnect(socket);
  });

  socket.on(
    "fireBullet",
    (bulletData: { id: string; x: number; y: number; angle: number }) => {
      const roomCode = findRoomCodeForSocket(socket.id);
      if (roomCode) {
        io.to(roomCode).emit("bulletFired", {
          ...bulletData,
          shooter: socket.id,
        });
      }
    }
  );

  socket.on(
    "bulletHitC",
    (hitData: {
      bulletId: string;
      targetId: string;
      x: number;
      y: number;
      shooter: string;
    }) => {
      const roomCode = findRoomCodeForSocket(socket.id);
      if (roomCode) {
        io.to(roomCode).emit("bulletHit", hitData);
      }
    }
  );
});

// Helper function to find the room code for a given socket ID
function findRoomCodeForSocket(socketId: string): string | undefined {
  for (const [code, room] of activeRooms.entries()) {
    if (room.players.some((player) => player.id === socketId)) {
      return code;
    }
  }
  return undefined;
}

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
