import kaplay from "kaplay";
import "kaplay/global";
import { io, Socket } from "socket.io-client";
import { createCreateMenu, createJoinMenu, createMenu } from "./menu";

let socket: Socket;

// Function to initialize socket connection
function initializeSocket() {
  socket = io("http://localhost:3000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on("roomCreated", (roomCode) => {
    console.log(`Room created with join code: ${roomCode}`);
  });
  socket.on("playerJoined", (players) => {
    console.log("Players in room:", players);
  });

  socket.on("playerLeft", (players) => {
    console.log("Player left, remaining players:", players);
  });

  socket.on("playerReady", (players) => {
    console.log("Player ready status updated:", players);
  });

  socket.on("gameStart", (data) => {
    console.log(`Game starting!`, data);
  });

  socket.on("roomError", (message) => {
    console.error("Room error: ", message);
  });
}

// Function to create a room
function createRoom() {
  socket.emit("createRoom");
}

// Function to join a room
function joinRoom(roomCode: string) {
  socket.emit("joinRoom", roomCode);
}

// Function to set player ready status
function setReady(isReady: boolean) {
  socket.emit("setReady", isReady);
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

createMenu(k);
createJoinMenu(k);
createCreateMenu(k);

k.go("menu");
