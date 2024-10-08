import {
  GameObj,
  KAPLAYCtx,
  PosComp,
  RotateComp,
  ScaleComp,
  SpriteComp,
} from "kaplay";
import { Socket } from "socket.io-client";
import addAbilitiesList from "./abilities/list";
import { createMissileSystem } from "./abilities/missile";
import { initCursor } from "./cursor";
import { createHealthBar, decreaseHealth, updateHealthBar } from "./healthbar";
import { Player } from "./menu";
import { createEnemy, createPlayer, debounce, displayError } from "./util";

const BULLET_SPEED = 2800;

export function createGameScene(k: KAPLAYCtx, socket: Socket) {
  return k.scene("game", (code: string, list: Player[]) => {
    const player = createPlayer(k, socket.id);
    const healthBar = createHealthBar(k);
    addAbilitiesList(k);

    // All these todo's will probably be functions,
    // keyword probably... They're just notes for now.
    // TODO: Create 3 ability buttons (bottom left)
    // TODO: Create instruction (bottom right)

    initCursor(k, player, socket, code);

    const enemies: Map<
      string,
      GameObj<PosComp | SpriteComp | ScaleComp | RotateComp>
    > = new Map();
    createMissileSystem(k, player, enemies);
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
        const bulletId = `${socket.id}-$${Date.now()}`;

        // Emit bullet creation to server
        socket.emit("fireBullet", {
          id: bulletId,
          x: player.pos.x,
          y: player.pos.y,
          angle: player.angle,
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
        console.log("fired");
        const { id, x, y, angle } = bulletData;
        const angleRad = ((angle - 90) * Math.PI) / 180;
        const dirX = Math.cos(angleRad);
        const dirY = Math.sin(angleRad);
        const bullet = k.add([
          k.pos(x, y),
          k.move(k.vec2(dirX, dirY), BULLET_SPEED),
          k.rect(5, 50),
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

    function handleBulletCollision(bullet: GameObj, target: GameObj) {
      const bulletId = Array.from(bullets.entries()).find(
        ([_, b]) => b === bullet
      )?.[0];

      if (bulletId && bullet.shooter !== target.playerId) {
        socket.emit("bulletHitC", {
          bulletId,
          targetId: target.playerId,
          x: target.pos.x,
          y: target.pos.y,
          shooter: bullet.shooter,
        });
        bullet.opacity = 0.1;
        bullet.destroy();
        bullets.delete(bulletId);

        // If the target is the current player, update health locally
        if (target.playerId === socket.id) {
          decreaseHealth(player, 10);
          updateHealthBar(healthBar, player);

          if (player.health <= 0) {
            k.go("lose");
            socket.emit("leave", true);
          }
        }
      }
    }

    // Check for bullet collisions with enemies
    k.onCollide("bullet", "enemy", (bullet, enemy) => {
      handleBulletCollision(bullet, enemy);
    });

    // Check for bullet collisions with the current player
    k.onCollide("bullet", "player", (bullet, playerObj) => {
      handleBulletCollision(bullet, playerObj);
    });

    k.onCollide("missile", "enemy", (missile: GameObj<PosComp>, enemy) => {
      k.addKaboom(missile.pos);
      missile.destroy();
      // Emit player hit or some thing
    });

    k.onCollide(
      "missile",
      "missile",
      (missile: GameObj<PosComp>, missileTwo) => {
        k.addKaboom(missile.pos);
        missile.destroy();
      }
    );

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

        // Only update client health if the person who got hit is the player..
        if (socket.id !== targetId) return;
        decreaseHealth(player, 10);
        updateHealthBar(healthBar, player);
      }
    );

    socket.on("error", (message: string) => {
      displayError(k, message, 5);
      console.error(message);
    });
  });
}
