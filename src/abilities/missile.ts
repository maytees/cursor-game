import {
  GameObj,
  KAPLAYCtx,
  PosComp,
  RotateComp,
  ScaleComp,
  SpriteComp,
  Vec2,
} from "kaplay";
import { decreaseHealth } from "../healthbar";
import { debounce } from "../util";

// Helper function to calculate angle difference
function angleDiff(a: number, b: number): number {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

// Missile class
class Missile {
  obj: GameObj;
  target: GameObj | null = null;
  initialSpeed: number = 70000;
  baseSpeed: number = 70000;
  speed: number = 70000;
  turnSpeed: number = 20000;
  fov: number = 120; // 120 degrees FOV
  curveStrength: number;
  randomOffset: Vec2;
  lastTargetPos: Vec2 | null = null;
  creationTime: number;
  lifespan: number = 10;

  constructor(k: KAPLAYCtx, pos: Vec2, angle: number) {
    this.creationTime = k.time();
    this.obj = k.add([
      k.pos(pos),
      k.offscreen({ distance: 400, destroy: true }),
      k.rect(40, 10),
      k.rotate(angle),
      k.color(k.Color.RED),
      k.area(),
      k.anchor("center"),
      k.opacity(1),
      "missile",
      {
        update: () => this.update(k),
      },
    ]);
    this.addBurnerEffect(k);
    this.curveStrength = k.rand(2, 10);
    this.randomOffset = k.Vec2.fromAngle(k.rand(0, 360)).scale(k.rand(10, 90));
  }

  addBurnerEffect(k: KAPLAYCtx) {
    this.obj.onUpdate(() => {
      const elapsedTime = k.time() - this.creationTime;
      const remainingLifespan = Math.max(0, this.lifespan - elapsedTime);

      const slowdownFactor = remainingLifespan / this.lifespan;

      const particlePos = this.obj.pos.sub(
        k.Vec2.fromAngle(this.obj.angle).scale(25)
      );
      const colors = [
        k.Color.RED,
        k.Color.fromHex("#FFA500"),
        k.Color.YELLOW,
        k.Color.WHITE,
      ];

      for (let i = 0; i < 3; i++) {
        const particleAngle = this.obj.angle + k.rand(-30, 30);
        const particleVelocity = k.Vec2.fromAngle(particleAngle + 180).scale(
          k.rand(150, 300) * slowdownFactor
        );

        k.add([
          k.pos(particlePos),
          k.rect(k.rand(5 * slowdownFactor, 15 * slowdownFactor), k.rand(3, 8)),
          k.rotate(particleAngle),
          k.color(k.choose(colors)),
          k.anchor("center"),
          k.opacity(k.rand(0.7, 1)),
          k.lifespan(k.rand(0.1, 0.3), { fade: 0.1 }),
          k.move(particleVelocity.x, particleVelocity.y),
        ]);
      }
    });
  }

  update(k: KAPLAYCtx) {
    const elapsedTime = k.time() - this.creationTime;
    const remainingLifespan = Math.max(0, this.lifespan - elapsedTime);

    // Gradually slow down the missile
    const slowdownFactor = remainingLifespan / this.lifespan;
    this.baseSpeed = this.initialSpeed * slowdownFactor;

    if (this.target) {
      const targetPos = this.target.pos.add(this.randomOffset);
      const targetAngle =
        (Math.atan2(
          targetPos.y - this.obj.pos.y,
          targetPos.x - this.obj.pos.x
        ) *
          180) /
        Math.PI;
      const angleDifference = angleDiff(targetAngle, this.obj.angle);

      // // Check if target is within FOV
      // if (Math.abs(angleDifference) <= this.fov / 2) {
      //   this.speed = this.baseSpeed * 1; // Increase speed
      // } else {
      //   this.speed = this.baseSpeed;
      // }

      // Curve towards the target
      const curveAngle = angleDifference * this.curveStrength * k.dt();
      this.obj.angle += curveAngle;

      // Add some randomness to the movement
      const randomAngle = k.rand(-5, 5) * k.dt();
      this.obj.angle += randomAngle;

      // Check if the target has moved
      if (!this.lastTargetPos || !targetPos.eq(this.lastTargetPos)) {
        this.lastTargetPos = targetPos.clone();
      } else {
        // If target hasn't moved, add some circular motion
        const orbitAngle = k.time() * 2; // Adjust for faster/slower orbiting
        const orbitOffset = k.Vec2.fromAngle(orbitAngle).scale(30);
        this.obj.pos = this.obj.pos.add(orbitOffset.scale(k.dt()));
      }
    }

    this.obj.move(k.Vec2.fromAngle(this.obj.angle).scale(this.speed * k.dt()));

    // Check if the missile is about to expire
    if (remainingLifespan <= 0.1) {
      this.explode(k);
    }
  }

  setTarget(target: GameObj) {
    this.target = target;
  }

  explode(k: KAPLAYCtx) {
    k.addKaboom(this.obj.pos);
    this.destroy();
  }

  destroy() {
    this.obj.destroy();
  }
}

// Missile system
export function createMissileSystem(
  k: KAPLAYCtx,
  player: GameObj<
    PosComp | RotateComp | ScaleComp | SpriteComp | { health: number }
  >,
  enemies: Map<string, GameObj>
) {
  const missiles: Missile[] = [];

  k.onKeyPress(
    "x",
    debounce(() => {
      // Spawn 5 units in front of the player
      const spawnDistance = 30;
      const missilePos = player.pos.add(
        k.Vec2.fromAngle(player.angle - 90).scale(spawnDistance)
      );
      const missile = new Missile(k, missilePos, player.angle - 90);
      missiles.push(missile);

      // Find the closest enemy in the FOV
      let closestEnemy: GameObj | null = null;
      let closestDist = Infinity;

      enemies.forEach((enemy) => {
        const enemyAngle =
          (Math.atan2(
            enemy.pos.y - missile.obj.pos.y,
            enemy.pos.x - missile.obj.pos.x
          ) *
            180) /
          Math.PI;
        const angleDifference = angleDiff(enemyAngle, missile.obj.angle);

        if (Math.abs(angleDifference) <= missile.fov / 2) {
          const dist = missile.obj.pos.dist(enemy.pos);
          if (dist < closestDist) {
            closestDist = dist;
            closestEnemy = enemy;
          }
        }
      });

      if (closestEnemy) {
        missile.setTarget(closestEnemy);
      }
    }, 0)
  );

  k.onCollide(
    "missile",
    "player",
    (
      missile,
      player: GameObj<
        PosComp | SpriteComp | ScaleComp | RotateComp | { health: number }
      >
    ) => {
      k.addKaboom(missile.pos);
      missile.destroy();
      decreaseHealth(player, 70);
    }
  );
}
