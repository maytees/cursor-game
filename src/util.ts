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

export function createPlayer(
  k: KAPLAYCtx,
  id?: string
): GameObj<PosComp | SpriteComp | ScaleComp | RotateComp> {
  return k.add([
    k.pos(100, 100),
    k.sprite("cursor"),
    k.scale(0.1),
    k.rotate(0),
    k.z(50),
    k.area(),
    k.anchor("top"),
    "player",
    {
      playerId: id,
    },
  ]);
}

export function createEnemy(
  k: KAPLAYCtx,
  id: string,
  pos: {
    x: number;
    y: number;
  }
): GameObj<PosComp | SpriteComp | ScaleComp | RotateComp> {
  const enemyObject = k.add([
    k.pos(pos.x, pos.y),
    k.sprite("enemy_cursor"),
    k.scale(0.1),
    k.rotate(0),
    k.area(),
    // Enemies should always be below main client?
    // Maybe?
    k.z(40),
    k.anchor("center"),
    "enemy",
    {
      playerId: id,
    },
  ]);

  return enemyObject;
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

export function addTitleText(k: KAPLAYCtx) {
  k.add([
    k.text("CURSOR", {
      size: 56,
      font: "press2p",
    }),
    k.anchor("center"),
    k.color(k.Color.BLACK),
    k.pos(k.center().x, k.center().y - 100),
  ]);
}

// goto is the scene to go back to
export function addBackButton(
  k: KAPLAYCtx,
  goto: string,
  yOffset: number,
  text?: string,
  onClickCallback?: any
) {
  const backButton = k.add([
    k.rect(56 * 6, 16 * 4),
    k.pos(k.center().x, k.center().y + yOffset),
    k.color(k.Color.BLACK),
    k.anchor("center"),
    k.outline(2, k.Color.BLACK),
    k.area(),
    "backButton",
  ]);

  const backButtonText = backButton.add([
    k.text(text ? text : "Back", { size: 24, font: "press2p" }),
    k.anchor("center"),
    k.color(k.Color.WHITE),
  ]);

  addTextHover(
    k,
    backButton,
    "backButton",
    k.Color.WHITE,
    k.Color.BLACK,
    backButtonText,
    true
  );

  k.onClick("backButton", () => {
    if (onClickCallback) {
      onClickCallback();
    }
    k.go(goto);
  });
}

export function displayError(k: KAPLAYCtx, error: string, lifeSpan?: number) {
  k.add([
    k.text(error, {
      size: 24,
      font: "press2p",
    }),
    k.pos(k.center().x, k.center().y - 340),
    k.color(k.Color.RED),
    k.anchor("center"),
    k.lifespan(lifeSpan ? lifeSpan : 2),
    k.opacity(1),
  ]);
}

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      return;
    }
    func.apply(this, args);
    timeoutId = setTimeout(() => {
      timeoutId = null;
    }, delay);
  };
}
