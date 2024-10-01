import { KAPLAYCtx } from "kaplay";

export function createGameScene(k: KAPLAYCtx) {
    return k.scene("game", () => {
        k.add([
            k.text("Game Scene", {
                size: 24,
                font: "press2p",
            }),
        ]);
    });
}
