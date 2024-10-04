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
import { Player } from "./menu";
import { createEnemy, createPlayer, debounce, displayError } from "./util";

const BULLET_SPEED = 800;

export function createGameScene(k: KAPLAYCtx, socket: Socket) {
  return k.scene("game", (code: string, list: Player[]) => {
    const player = createPlayer(k);
    // All these todo's will probably be functions,
    // keyword probably... They're just notes for now.
    // TODO: Create enemy
    // TODO: Create 3 ability buttons (bottom left)
    // TODO: Create instruction (bottom right)

    initCursor(k, player, socket, code);
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
      displayError(k, message, 5);
      console.error(message);
    });
  });
}
