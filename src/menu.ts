import { KAPLAYCtx } from "kaplay";
import { Socket } from "socket.io-client";
import { initCursor } from "./cursor";
import createPlayer, {
  addBackButton,
  addTextHover,
  addTitleText,
  displayError,
} from "./util";

// Only use this for reference
// k.onKeyPress("enter", () => {
//   k.go("game");
// });

type Player = {
  id: string;
  name: string;
  ready: boolean;
};

export function createMenu(k: KAPLAYCtx, socket: Socket) {
  return k.scene("menu", () => {
    const player = createPlayer(k);

    initCursor(k, player);
    addTitleText(k);

    const joinParty = k.add([
      k.rect(56 * 6, 16 * 4),
      k.pos(k.center().x, k.center().y),
      k.color(k.Color.WHITE),
      k.outline(2, k.Color.BLACK),
      k.anchor("center"),
      k.area(),
      // This is just a tag
      "joinParty",
    ]);

    const joinPartyText = joinParty.add([
      k.text("Join Party", { size: 24, font: "press2p" }),
      k.anchor("center"),
      k.color(k.Color.BLACK),
    ]);

    addTextHover(
      k,
      joinParty,
      "joinParty",
      k.Color.BLACK,
      k.Color.WHITE,
      joinPartyText,
      true
    );

    const createParty = k.add([
      k.rect(56 * 6, 16 * 4),
      k.pos(k.center().x, k.center().y + 90),
      k.color(k.Color.BLACK),
      k.anchor("center"),
      k.outline(2, k.Color.BLACK),
      k.area(),
      // This is just a tag
      "createParty",
    ]);

    const createPartyText = createParty.add([
      k.text("Create Party", { size: 24, font: "press2p" }),
      k.anchor("center"),
      k.color(k.Color.WHITE),
    ]);

    addTextHover(
      k,
      createParty,
      "createParty",
      k.Color.WHITE,
      k.Color.BLACK,
      createPartyText,
      true
    );

    k.onClick("createParty", () => {
      socket.emit("createRoom");
      socket.on("roomCreated", (roomCode: string, list: Player[]) => {
        k.go("waitingRoom", roomCode, list);
        // This ensures that the listener wont be duplicated
        socket.off("roomCreated");
      });
    });

    k.onClick("joinParty", () => {
      k.go("joinMenu");
    });
  });
}

export function createJoinMenu(k: KAPLAYCtx, socket: Socket) {
  return k.scene("joinMenu", () => {
    const player = createPlayer(k);

    initCursor(k, player);
    addTitleText(k);

    k.add([
      k.rect(56 * 6, 16 * 4),
      k.pos(k.center().x, k.center().y),
      k.z(30),
      k.anchor("center"),
      k.outline(2, k.Color.BLACK),
      k.area(),
      // This is just a tag
      "createParty",
    ]);

    const codeInput = k.add([
      k.text("Code", {
        font: "press2p",
      }),
      k.z(40),
      k.textInput(true, 6),
      k.pos(k.center().x, k.center().y),
      k.color(k.Color.BLACK),
      k.anchor("center"),
      "codeInput",
      // This is just a tag
    ]);

    const confirmCode = k.add([
      k.rect(56 * 6, 16 * 4),
      k.pos(k.center().x, k.center().y + 80),
      k.color(k.Color.WHITE),
      k.outline(2, k.Color.BLACK),
      k.anchor("center"),
      k.area(),
      // This is just a tag
      "confirmCode",
    ]);

    const confirmCodeText = confirmCode.add([
      k.text("Join Party", { size: 24, font: "press2p" }),
      k.anchor("center"),
      k.color(k.Color.BLACK),
    ]);

    addTextHover(
      k,
      confirmCode,
      "confirmCode",
      k.Color.BLACK,
      k.Color.WHITE,
      confirmCodeText,
      true
    );

    k.onClick("confirmCode", () => {
      socket.emit("joinRoom", codeInput.text.toUpperCase());

      socket.on("roomError", (error: string) => {
        // TODO: Display error
        console.error(error);
        displayError(k, error);

        socket.off("roomError");
      });

      socket.on("joinSuccess", (list: Player[]) => {
        console.log("Join success");
        k.go("waitingRoom", codeInput.text, list);

        socket.off("joinSuccess");
      });
    });

    addBackButton(k, "menu", 180);
  });
}

export function createWaitingRoomMenu(k: KAPLAYCtx, socket: Socket) {
  return k.scene("waitingRoom", (joinCode: string, list: Player[]) => {
    const player = createPlayer(k);

    initCursor(k, player);
    addTitleText(k);

    // Display join code
    k.add([
      k.text(`Join Code: ${joinCode}`, {
        size: 32,
        font: "press2p",
      }),
      k.pos(k.center().x, k.center().y - 400),
      k.color(k.Color.BLACK),
      k.anchor("top"),
    ]);

    // Player list
    let players: Player[] = list;

    let playerStatusObjects: any[] = [];
    let playerNameObjects: any[] = [];

    function updatePlayerList() {
      // Clear existing player status and name objects
      playerStatusObjects.forEach((obj) => obj.destroy());
      playerNameObjects.forEach((obj) => obj.destroy());
      playerStatusObjects = [];
      playerNameObjects = [];

      // Recreate player status and name objects
      players.forEach((player, index) => {
        const statusColor = player.ready
          ? k.Color.fromHex("#00FF00")
          : k.Color.fromHex("#FF0000");

        const nameObj = k.add([
          k.text(`${player.name}`, {
            size: 24,
            font: "press2p",
          }),
          k.pos(k.center().x - 170, k.center().y - 50 + index * 40),
          k.color(k.Color.BLACK),
          k.anchor("topleft"),
        ]);
        playerNameObjects.push(nameObj);

        const statusObj = k.add([
          k.rect(20, 20),
          k.pos(k.center().x + 150, k.center().y - 40 + index * 40),
          k.color(statusColor),
          k.anchor("center"),
        ]);
        playerStatusObjects.push(statusObj);
      });
    }

    socket.on("playerJoined", (plrs: Player[]) => {
      players = plrs;
      updatePlayerList();
    });

    socket.on("playerLeft", (plrs: Player[]) => {
      // Don't update if the player which left is the current user
      if (plrs.some((player) => player.id !== socket.id)) {
        return;
      }

      players = plrs;
      updatePlayerList();
    });

    updatePlayerList();

    // Ready/Unready button
    let isReady = false;
    const readyButton = k.add([
      k.rect(56 * 6, 16 * 4),
      k.pos(k.center().x, k.center().y + 80),
      k.color(
        isReady ? k.Color.fromHex("#00FF00") : k.Color.fromHex("#FF0000")
      ),
      k.outline(2, k.Color.BLACK),
      k.anchor("center"),
      k.area(),
      "readyButton",
    ]);

    const readyButtonText = readyButton.add([
      k.text(isReady ? "Ready" : "Not Ready", { size: 24, font: "press2p" }),
      k.anchor("center"),
      k.color(k.Color.BLACK),
    ]);

    // Start Game button
    const startButton = k.add([
      k.rect(56 * 6, 16 * 4),
      k.pos(k.center().x, k.center().y + 160),
      k.color(k.Color.fromHex("#999999")),
      k.outline(2, k.Color.BLACK),
      k.anchor("center"),
      k.area(),
      "startButton",
    ]);

    const startButtonText = startButton.add([
      k.text("Start Game", { size: 24, font: "press2p" }),
      k.anchor("center"),
      k.color(k.Color.BLACK),
    ]);

    function updateStartButton() {
      const allReady = players.every((player) => player.ready);
      if (allReady) {
        startButton.color = k.Color.GREEN;
      } else {
        startButton.color = k.Color.fromHex("#999999");
      }
    }

    updateStartButton();

    readyButton.onClick(() => {
      isReady = !isReady;

      socket.emit("setReady", isReady);
      updateStartButton();
    });

    socket.on("playerReady", (updatedPlayers: Player[]) => {
      players = updatedPlayers;
      updatePlayerList();
      updateStartButton();
    });

    k.onHover("readyButton", () => {
      readyButton.color = isReady
        ? k.Color.fromHex("#00CC00") // Darker green
        : k.Color.fromHex("#CC0000"); // Darker red
      readyButtonText.color = k.Color.WHITE;
    });

    k.onHoverEnd("readyButton", () => {
      readyButton.color = isReady
        ? k.Color.fromHex("#00FF00")
        : k.Color.fromHex("#FF0000");
      readyButtonText.color = k.Color.BLACK;
    });

    k.onHover("startButton", () => {
      const allReady = players.every((player) => player.ready);
      if (allReady) {
        startButton.color = k.Color.fromHex("#00CC00"); // Darker green
        startButtonText.color = k.Color.WHITE;
      }
    });

    k.onHoverEnd("startButton", () => {
      const allReady = players.every((player) => player.ready);
      if (allReady) {
        startButton.color = k.Color.GREEN;
        startButtonText.color = k.Color.BLACK;
      }
    });

    k.onClick("startButton", () => {
      const allReady = players.every((player) => player.ready);
      if (allReady) {
        // Add logic to start the game
        console.log("Starting the game!");
        k.go("game");
      } else {
        // Display a message that all players must be ready
        displayError(k, "All players must be ready!");
      }
    });

    addBackButton(k, "menu", 240, "Leave", () => {
      socket.emit("leave");
      players = [];
      playerNameObjects = [];
      playerStatusObjects = [];
      updatePlayerList();
      playerNameObjects = [];
      playerStatusObjects = [];
    });
  });
}
