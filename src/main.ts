import kaplay from "kaplay";
import "kaplay/global";
import { io, Socket } from "socket.io-client";
import { createGameScene } from "./game";
import { createJoinMenu, createMenu, createWaitingRoomMenu } from "./menu";

let socket: Socket;

// Function to initialize socket connection
function initializeSocket() {
  socket = io("http://localhost:3000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to server");
  });
}

const k = kaplay({
  crisp: false,
});

k.setBackground(k.Color.WHITE);

// TODO: Create load assets func
k.loadSprite("cursor", "sprites/cursor.svg");
k.loadFont("press2p", "fonts/PressStart2P-Regular.ttf");

// Initialize socket when the page loads
initializeSocket();

createMenu(k, socket);
createJoinMenu(k, socket);
createWaitingRoomMenu(k, socket);
createGameScene(k);

k.go("menu");
