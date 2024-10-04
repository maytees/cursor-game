import { GameObj, KAPLAYCtx, PosComp, RotateComp } from "kaplay";
import { Socket } from "socket.io-client";

export function initCursor(
  k: KAPLAYCtx,
  player: GameObj<PosComp | RotateComp>,
  socket?: Socket,
  roomCode?: string
) {
  k.onMouseMove((pos) => {
    const angle = Math.atan2(pos.y - player.pos.y, pos.x - player.pos.x);
    // Convert radians to degrees and adjust for Kaplay's rotation system
    let degrees = (angle * (180 / Math.PI) + 90 + 360) % 360;

    // Calculate the shortest rotation path
    let rotationDiff = degrees - player.angle;
    if (rotationDiff > 180) rotationDiff -= 360;
    if (rotationDiff < -180) rotationDiff += 360;

    // Lerp the rotation
    player.angle = (player.angle + k.lerp(0, rotationDiff, 0.1) + 360) % 360;

    // Move the player to the mouse position
    player.pos = k.vec2(
      k.lerp(player.pos.x, pos.x, 0.1),
      k.lerp(player.pos.y, pos.y, 0.1)
    );

    if (socket && roomCode) {
      socket.emit("move", player.pos.x, player.pos.y, player.angle, roomCode);
    }
  });
}
