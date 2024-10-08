import { KAPLAYCtx } from "kaplay";
import { Socket } from "socket.io-client";
import { initCursor } from "./cursor";
import { addBackButton, addTitleText, createPlayer } from "./util";

export function createLoseScene(k: KAPLAYCtx, socket: Socket) {
  return k.scene("lose", () => {
    const player = createPlayer(k, socket.id);
    initCursor(k, player, socket);

    addTitleText(k);

    k.add([
      k.text("haha you lose", {
        size: 32,
        font: "press2p",
      }),
      k.anchor("center"),
      k.color(k.Color.RED),
      k.pos(k.center().x, k.center().y),
    ]);

    addBackButton(k, "menu", 180);
  });
}
