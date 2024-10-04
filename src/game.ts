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

const BULLET_SPEED = 5800;

export function createGameScene(k: KAPLAYCtx, socket: Socket) {
  return k.scene("game", (code: string, list: Player[]) => {
    const player = createPlayer(k, socket.id);
    // All these todo's will probably be functions,
    // keyword probably... They're just notes for now.
    // TODO: Create 3 ability buttons (bottom left)
    // TODO: Create instruction (bottom right)

    initCursor(k, player, socket, code);
    const enemies: Map<
      string,
      GameObj<PosComp | SpriteComp | ScaleComp | RotateComp>
    > = new Map();
    const bullets = new Map<string, GameObj>();

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

        const bulletId = `${socket.id}-${Date.now()}`;
        const bullet = k.add([
          k.pos(vec2(player.pos.x + x, player.pos.y + y)),
          k.move(k.vec2(x, y), BULLET_SPEED),
          k.rect(2, 20),
          k.rotate(player.angle),
          k.area(),
          k.offscreen({ destroy: true }),
          k.anchor("center"),
          k.color(k.Color.BLACK),
          "bullet",
        ]);

        bullets.set(bulletId, bullet);

        // Emit bullet creation to server
        socket.emit("fireBullet", {
          id: bulletId,
          x: player.pos.x,
          y: player.pos.y,
          angle: player.angle,
        });

        // Destroy bullet after 5 seconds
        k.wait(5, () => {
          bullet.destroy();
          bullets.delete(bulletId);
        });
      }, 200)
    );

    // Listen for bullets fired by other players
    socket.on(
      "bulletFired",
      (bulletData: {
        id: string;
        x: number;
        y: number;
        angle: number;
        shooter: string;
      }) => {
        const { id, x, y, angle } = bulletData;
        const angleRad = ((angle - 90) * Math.PI) / 180;
        const dirX = Math.cos(angleRad);
        const dirY = Math.sin(angleRad);

        const bullet = k.add([
          k.pos(x + dirX, y + dirY),
          k.move(k.vec2(dirX, dirY), BULLET_SPEED),
          k.rect(2, 20),
          k.rotate(angle),
          k.area(),
          k.offscreen({ destroy: true }),
          k.anchor("center"),
          k.color(k.Color.BLACK),
          "bullet",
          {
            shooter: bulletData.shooter,
          },
        ]);

        bullets.set(id, bullet);

        // Destroy bullet after 5 seconds
        k.wait(5, () => {
          bullet.destroy();
          bullets.delete(id);
        });
      }
    );

    function handleBulletCollision(bullet: GameObj, other: GameObj) {
      console.log("hit");
      const bulletId = Array.from(bullets.entries()).find(
        ([_, b]) => b === bullet
      )?.[0];
      if (bulletId) {
        socket.emit("bulletHitC", {
          bulletId,
          targetId: other.playerId,
          x: other.pos.x,
          y: other.pos.y,
          shooter: bullet.shooter, // i think this sends the player's id?
        });
        bullet.destroy();
        bullets.delete(bulletId);
      }
    }
    // Check for bullet collisions with enemies
    k.onCollide("bullet", "enemy", (bullet, enemy) => {
      handleBulletCollision(bullet, enemy);
    });

    // Listen for bullet hits
    socket.on(
      "bulletHit",
      (hitData: {
        bulletId: string;
        targetId: string;
        x: number;
        y: number;
        shooter: string;
      }) => {
        const { x, y, shooter, targetId } = hitData;
        if (shooter === targetId) return;
        addKaboom(vec2(x, y));
      }
    );

    socket.on("error", (message: string) => {
      displayError(k, message, 5);
      console.error(message);
    });
  });
}
