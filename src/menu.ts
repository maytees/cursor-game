import { KAPLAYCtx } from "kaplay";
import { initCursor } from "./cursor";
import createPlayer, { addTextHover } from "./util";

// Only use this for reference
// k.onKeyPress("enter", () => {
//   k.go("game");
// });

function addTitleText(k: KAPLAYCtx) {
  k.add([
    k.text("Cursor", {
      size: 56,
      font: "press2p",
    }),
    k.anchor("center"),
    k.color(k.Color.BLACK),
    k.pos(k.center().x, k.center().y - 100),
  ]);
}

// goto is the scene to go back to
function addBackButton(k: KAPLAYCtx, goto: string, yOffset: number) {
  const backButton = k.add([
    k.rect(56 * 6, 16 * 4),
    k.pos(k.center().x, k.center().y + yOffset),
    k.color(k.Color.BLACK),
    k.anchor("center"),
    k.outline(2, k.Color.BLACK),
    k.area(),
    // This is just a tag
    "backButton",
  ]);

  const backButtonText = backButton.add([
    k.text("Back", { size: 24, font: "press2p" }),
    k.anchor("center"),
    k.color(k.Color.WHITE),
  ]);

  addTextHover(
    k,
    backButton,
    "backButton",
    k.Color.WHITE,
    k.Color.BLACK,
    backButtonText,
    true
  );

  k.onClick("backButton", () => {
    k.go(goto);
  });
}

export function createMenu(k: KAPLAYCtx) {
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
      k.go("waitingRoom");
    });

    k.onClick("joinParty", () => {
      k.go("joinMenu");
    });
  });
}

export function createJoinMenu(k: KAPLAYCtx) {
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

    k.add([
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
      k.go("waitingRoom");
    });

    addBackButton(k, "menu", 180);
  });
}

export function createWaitingRoomMenu(k: KAPLAYCtx) {
  return k.scene("waitingRoom", () => {
    const player = createPlayer(k);

    initCursor(k, player);
    addTitleText(k);

    // Display join code
    const joinCode = "ABC123"; // This should be generated or fetched
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
    const players = [
      { name: "You", ready: false },
      { name: "Player 2", ready: true },
    ];

    const playerStatusObjects = players.map((player, index) => {
      const statusColor = player.ready
        ? k.Color.fromHex("#00FF00")
        : k.Color.fromHex("#FF0000");
      k.add([
        k.text(`${player.name}`, {
          size: 24,
          font: "press2p",
        }),
        k.pos(k.center().x - 170, k.center().y - 50 + index * 40),
        k.color(k.Color.BLACK),
        k.anchor("topleft"),
      ]);
      return k.add([
        k.rect(20, 20),
        k.pos(k.center().x + 150, k.center().y - 40 + index * 40),
        k.color(statusColor),
        k.anchor("center"),
      ]);
    });

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
      const allReady = players.every(player => player.ready);
      if (allReady) {
        startButton.color = k.Color.GREEN;
      } else {
        startButton.color = k.Color.fromHex("#999999");
      }
    }

    updateStartButton();

    readyButton.onClick(() => {
      isReady = !isReady;
      players[0].ready = isReady;
      readyButton.color = isReady
        ? k.Color.fromHex("#00FF00")
        : k.Color.fromHex("#FF0000");
      readyButtonText.text = isReady ? "Ready" : "Not Ready";
      playerStatusObjects[0].color = isReady
        ? k.Color.fromHex("#00FF00")
        : k.Color.fromHex("#FF0000");
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
      const allReady = players.every(player => player.ready);
      if (allReady) {
        startButton.color = k.Color.fromHex("#00CC00"); // Darker green
        startButtonText.color = k.Color.WHITE;
      }
    });

    k.onHoverEnd("startButton", () => {
      const allReady = players.every(player => player.ready);
      if (allReady) {
        startButton.color = k.Color.GREEN;
        startButtonText.color = k.Color.BLACK;
      }
    });

    k.onClick("startButton", () => {
      const allReady = players.every(player => player.ready);
      if (allReady) {
        // Add logic to start the game
        console.log("Starting the game!");
        k.go("game");
      } else {
        // Display a message that all players must be ready
        k.add([
          k.text("All players must be ready!", {
            size: 24,
            font: "press2p",
          }),
          k.pos(k.center().x, k.center().y - 440),
          k.color(k.Color.RED),
          k.anchor("center"),
          k.lifespan(2),
          k.opacity(1),
        ]);
      }
    });

    addBackButton(k, "menu", 240);
  });
}
