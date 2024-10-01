import {
  Color,
  ColorComp,
  GameObj,
  KAPLAYCtx,
  PosComp,
  RotateComp,
  ScaleComp,
  SpriteComp,
} from "kaplay";

export default function createPlayer(
  k: KAPLAYCtx
): GameObj<PosComp | SpriteComp | ScaleComp | RotateComp> {
  return k.add([
    k.pos(100, 100),
    k.sprite("cursor"),
    k.scale(0.1),
    k.rotate(0),
    k.z(50),
  ]);
}

export function addTextHover(
  k: KAPLAYCtx,
  button: GameObj,
  buttonTag: string,
  baseColor?: Color,
  hoverColor?: Color,
  text?: GameObj<ColorComp>,
  isOutline = false
) {
  if (isOutline) {
    k.onHover(buttonTag, () => {
      button.color = baseColor;
      text.color = hoverColor;
    });

    k.onHoverEnd(buttonTag, () => {
      button.color = hoverColor;
      text.color = baseColor;
    });
    return;
  }

  k.onHover(buttonTag, () => {
    button.color = hoverColor;
  });

  k.onHoverEnd(buttonTag, () => {
    button.color = baseColor;
  });
}
