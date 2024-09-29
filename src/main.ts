import kaplay from "kaplay";
import "kaplay/global";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

socket.on("hello", (message) => {
  console.log("Recieved hello event: ", message);
});

document.getElementById("playBtn").addEventListener("click", () => {
  const enteredRoomCode = (
    document.getElementById("joinCode") as HTMLInputElement
  ).value;
  console.log("Entered room code:", enteredRoomCode);
  if (enteredRoomCode) {
    joinRoom(enteredRoomCode);
  } else {
    console.error("No room code entered");
    // Maybe show an error message to the user
    const errorElement = document.getElementById("errorMessage");
    errorElement.style.color = "red";
    errorElement.style.display = "block";
    errorElement.innerHTML = "Invalid room code!";
  }
});

function createRoom() {
  socket.emit("createRoom");
}

function joinRoom(roomCode: string) {
  console.log("room code: ", roomCode, "(frontend)");
  const e = socket.emit("joinRoom", roomCode);
}

socket.on("roomCreated", (roomCode) => {
  console.log(`Room created with join code: ${roomCode}`);
});

socket.on("waitingForPlayers", () => {
  console.log("Waiting for another player to join...");
});

socket.on("gameStart", (data) => {
  console.log(`Game starting!`, data);
});

socket.on("roomError", (message) => {
  console.error("Room err: ", message);
  const errorElement = document.getElementById("errorMessage");
  errorElement.style.color = "red";
  errorElement.style.display = "block";
  errorElement.innerHTML = "Invalid room code!";
});

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

function hideMainMenu() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("triangle-container").style.display = "none";
}

// Function to start the game
function startGame() {
  const k = kaplay({
    crisp: true,
  });

  k.loadSprite("cursor", "sprites/cursor.svg");

  const player = k.add([
    k.pos(100, 100),
    k.sprite("cursor"),
    k.scale(0.1),
    k.rotate(0),
  ]);

  // Function to get the nearest 8-directional angle
  function getNearestDirection(angle) {
    const directions = [
      0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270,
      292.5, 315, 337.5,
    ];
    return directions.reduce((prev, curr) =>
      Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev
    );
  }

  k.onMouseMove((pos) => {
    const angle = Math.atan2(pos.y - player.pos.y, pos.x - player.pos.x);

    // Convert radians to degrees and adjust for Kaplay's rotation system
    let degrees = (angle * (180 / Math.PI) + 90 + 360) % 360;

    // Get the nearest 8-directional angle
    const targetAngle = getNearestDirection(degrees);

    // Calculate the shortest rotation path
    let rotationDiff = targetAngle - player.angle;
    if (rotationDiff > 180) rotationDiff -= 360;
    if (rotationDiff < -180) rotationDiff += 360;

    // Lerp the rotation
    player.angle = (player.angle + k.lerp(0, rotationDiff, 0.1) + 360) % 360;

    // Move the player to the mouse position
    player.pos = k.vec2(
      k.lerp(player.pos.x, pos.x, 0.1),
      k.lerp(player.pos.y, pos.y, 0.1)
    );
  });
}
