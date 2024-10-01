import { GameObj, KAPLAYCtx } from "kaplay";

export function initCursor(k: KAPLAYCtx, player: GameObj) {
  // Function to get the nearest 8-directional angle
  function getNearestDirection(angle) {
    const directions = [
      0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270,
      292.5, 315, 337.5,
    ];
    return directions.reduce((prev, curr) =>
      Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev
    );
  }

  k.onMouseMove((pos) => {
    const angle = Math.atan2(pos.y - player.pos.y, pos.x - player.pos.x);

    // Convert radians to degrees and adjust for Kaplay's rotation system
    let degrees = (angle * (180 / Math.PI) + 90 + 360) % 360;

    // Get the nearest 8-directional angle
    const targetAngle = getNearestDirection(degrees);

    // Calculate the shortest rotation path
    let rotationDiff = targetAngle - player.angle;
    if (rotationDiff > 180) rotationDiff -= 360;
    if (rotationDiff < -180) rotationDiff += 360;

    // Lerp the rotation
    player.angle = (player.angle + k.lerp(0, rotationDiff, 0.1) + 360) % 360;

    // Move the player to the mouse position
    player.pos = k.vec2(
      k.lerp(player.pos.x, pos.x, 0.1),
      k.lerp(player.pos.y, pos.y, 0.1)
    );
  });
}
