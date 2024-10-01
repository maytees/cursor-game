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
      k.go("createMenu");
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

    addBackButton(k, "menu", 180);
  });
}

export function createCreateMenu(k: KAPLAYCtx) {
  return k.scene("createMenu", () => {
    const player = createPlayer(k);

    initCursor(k, player);
    addTitleText(k);
  });
}
