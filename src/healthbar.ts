import {
  ColorComp,
  GameObj,
  KAPLAYCtx,
  PosComp,
  RectComp,
  RotateComp,
  ScaleComp,
  SpriteComp,
} from "kaplay";

// returns the green only..
export function createHealthBar(
  k: KAPLAYCtx
): GameObj<PosComp | RectComp | ColorComp> {
  add([k.rect(200, 20), k.pos(20, 20), k.color(RED)]);

  return add([rect(200, 20), pos(20, 20), color(GREEN)]);
}

export function updateHealthBar(
  healthBar: GameObj<PosComp | RectComp | ColorComp>,
  player: GameObj<
    PosComp | SpriteComp | ScaleComp | RotateComp | { health: number }
  >
) {
  healthBar.width = 2 * player.health;
}

export function decreaseHealth(
  player: GameObj<
    PosComp | SpriteComp | ScaleComp | RotateComp | { health: number }
  >,
  by: number
) {
  player.health = Math.max(0, player.health - by);
}

export function increaseHealth(
  player: GameObj<
    PosComp | SpriteComp | ScaleComp | RotateComp | { health: number }
  >,
  by: number
) {
  player.health = Math.min(100, player.health + by);
}
