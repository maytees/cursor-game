import { KAPLAYCtx } from "kaplay";
import { Socket } from "socket.io-client";
import { initCursor } from "./cursor";
import { createPlayer, debounce } from "./util";

const BULLET_SPEED = 800;

export function createGameScene(k: KAPLAYCtx, socket: Socket) {
  return k.scene("game", (code: string) => {
    const player = createPlayer(k);
    // All these todo's will probably be functions,
    // keyword probably... They're just notes for now.
    // TODO: Create enemy
    // TODO: Create 3 ability buttons (bottom left)
    // TODO: Create instruction (bottom right)

    initCursor(k, player, socket, code);

    k.onMousePress(
      "left",
      debounce(() => {
        // Get player direciton
        // Shoot bullet
        // const direction = player.pos.unit();

        const angleRad = ((player.angle - 90) * Math.PI) / 180;

        // Calculate the x and y components of the unit vector
        const x = Math.cos(angleRad);
        const y = Math.sin(angleRad);

        add([
          pos(player.pos),
          move(vec2(x, y), BULLET_SPEED),
          rect(2, 20),
          rotate(player.angle),
          area(),
          offscreen({ destroy: true }),
          anchor("center"),
          offscreen({ destroy: true }),
          color(k.Color.BLACK),
          "bullet",
        ]);
      }, 200)
    );

    socket.on("error", (message: string) => {
      console.error(message);
    });
  });
}
