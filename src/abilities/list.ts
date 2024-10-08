import { KAPLAYCtx } from "kaplay";

export default function addAbilitiesList(k: KAPLAYCtx) {
  const pewButton = k.add([
    k.rect(100, 100),
    k.pos(80, k.height() - 80),
    k.outline(2, k.BLACK),
    k.anchor("center"),
  ]);

  pewButton.add([
    k.text("pew", {
      size: 18,
      font: "press2p",
      align: "center",
    }),
    k.anchor("center"),
    k.color(k.BLACK),
  ]);

  k.add([
    k.text("left", {
      font: "press2p",
      size: 18,
      align: "center",
    }),
    k.pos(80, k.height() - 150),
    k.color(k.BLACK),
    k.anchor("center"),
  ]);

  const missileButton = k.add([
    k.rect(100, 100),
    k.pos(200, k.height() - 80),
    k.outline(2, k.BLACK),
    k.anchor("center"),
  ]);

  missileButton.add([
    k.text("missl", {
      size: 18,
      font: "press2p",
      align: "center",
    }),
    k.anchor("center"),
    k.color(k.BLACK),
  ]);

  k.add([
    k.text("x", {
      font: "press2p",
      size: 18,
      align: "center",
    }),
    k.pos(200, k.height() - 150),
    k.color(k.BLACK),
    k.anchor("center"),
  ]);
}
