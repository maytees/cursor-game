import {
  GameObj,
  KAPLAYCtx,
  PosComp,
  RotateComp,
  ScaleComp,
  SpriteComp,
} from "kaplay";
import { Socket } from "socket.io-client";
import { initCursor } from "./cursor";
import {
  addBackButton,
  addTextHover,
  addTitleText,
  createEnemy,
  createPlayer,
  displayError,
} from "./util";

// Only use this for reference
// k.onKeyPress("enter", () => {
//   k.go("game");
// });

export type Player = {
  id: string;
  name: string;
  ready: boolean;
  host: boolean;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
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
      socket.emit("joinRoom", codeInput.text);

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

    initCursor(k, player, socket, joinCode);
    addTitleText(k);

    // go through list of players and render them?

    const enemies: Map<
      string,
      GameObj<PosComp | SpriteComp | ScaleComp | RotateComp>
    > = new Map();

    list.forEach((player) => {
      if (player.id === socket.id) return;

      enemies.set(
        player.id,
        createEnemy(k, player.id, {
          x: player.position.x,
          y: player.position.y,
        })
      );
    });

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
          k.text(`${socket.id === player.id ? "YOU" : player.name}`, {
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

    socket.on(
      "playerJoined",
      (
        plrs: Player[],
        newPlayerId: string,
        pos: {
          x: number;
          y: number;
        }
      ) => {
        const enemy = createEnemy(k, newPlayerId, {
          x: pos.x,
          y: pos.y,
        });

        enemies.set(newPlayerId, enemy);

        players = plrs;
        updatePlayerList();
      }
    );

    socket.on("playerLeft", (plrs: Player[]) => {
      // Don't update if the player which left is the current user
      if (plrs.some((player) => player.id !== socket.id)) return;

      // If the player which left is the host, then disconnect
      if (!plrs.some((player) => player.host)) {
        socket.emit("leave");
        players = [];
        playerNameObjects = [];
        playerStatusObjects = [];
        updatePlayerList();
        k.go("menu");
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

    // Start Game button (only for host)
    let startButton: GameObj;
    let startButtonText: GameObj;

    const currentPlayer = players.find((player) => player.id === socket.id);
    if (currentPlayer && currentPlayer.host) {
      startButton = k.add([
        k.rect(56 * 6, 16 * 4),
        k.pos(k.center().x, k.center().y + 160),
        k.color(k.Color.fromHex("#999999")),
        k.outline(2, k.Color.BLACK),
        k.anchor("center"),
        k.area(),
        "startButton",
      ]);

      startButtonText = startButton.add([
        k.text("Start Game", { size: 24, font: "press2p" }),
        k.anchor("center"),
        k.color(k.Color.BLACK),
      ]);
    }

    function updateStartButton() {
      if (!currentPlayer || !currentPlayer.host) return;

      const allReady = players.every((player) => player.ready);
      if (allReady) {
        startButton.color = k.Color.GREEN;
      } else {
        startButton.color = k.Color.fromHex("#999999");
      }
    }

    if (currentPlayer && currentPlayer.host) {
      updateStartButton();
    }

    socket.on("playerReady", (updatedPlayers: Player[]) => {
      players = updatedPlayers;
      updatePlayerList();
      if (currentPlayer && currentPlayer.host) {
        updateStartButton();
      }
    });

    readyButton.onClick(() => {
      isReady = !isReady;

      socket.emit("setReady", isReady);
      if (currentPlayer && currentPlayer.host) {
        updateStartButton();
      }
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

    if (currentPlayer && currentPlayer.host) {
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
          socket.emit("startGame", joinCode);
          k.go("game", joinCode, players);
        } else {
          // Display a message that all players must be ready
          displayError(k, "All players must be ready!");
        }
      });
    }

    socket.on("gameStart", () => {
      console.log("Starting the game!");
      k.go("game", joinCode, players);
    });

    addBackButton(k, "menu", 240, "Leave", () => {
      socket.emit("leave");
      players = [];
      playerNameObjects = [];
      playerStatusObjects = [];
      updatePlayerList();
    });

    socket.on(
      "playerMoved",
      (id: string, x: number, y: number, rotation: number) => {
        // Update enemy position/rotation in enemies map ( not players )
        if (!enemies.has(id)) {
          console.log(id);
          const message = "Invalid user id;";
          console.error(message);
          displayError(k, message, 5);
          return;
        }

        let entry = enemies.get(id);
        entry.pos = vec2(x, y);
        entry.rotateTo(rotation);

        enemies.set(id, entry);
      }
    );
  });
}
