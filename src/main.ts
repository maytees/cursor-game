import kaplay from "kaplay";
import "kaplay/global";

const k = kaplay();

k.loadSprite("cursor", "sprites/cursor.svg");

const player = k.add([
  k.pos(100, 100),
  k.sprite("cursor"),
  k.scale(0.1),
  k.rotate(0),
]);

// Function to get the nearest 8-directional angle
function getNearestDirection(angle) {
  const directions = [0, 45, 90, 135, 180, 225, 270, 315];
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
