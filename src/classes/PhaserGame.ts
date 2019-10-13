import { number } from "prop-types";
import * as Phaser from "phaser";

declare const window: {
    DEBUG: boolean | undefined;
    PHASER: boolean | undefined;
};

class MainScene extends Phaser.Scene {
    preload() {
        this.game.scale.scaleMode = Phaser.Scale.ScaleModes.ENVELOP;
        this.game.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
        console.log("this.cameras.main: ", this.cameras.main); // XX
        this.cameras.main.setBackgroundColor("#eee");
        this.load.image("ball", "assets/ball.png");
    }
    create() {
        this.add.sprite(50, 50, "ball");
    }
    update() {}
}

window.DEBUG = true;
export class Game {
    game: Phaser.Game;
    constructor(div: HTMLDivElement) {
        console.log("making game"); // XX
        this.game = new Phaser.Game({
            width: 480,
            height: 320,
            type: Phaser.CANVAS,
            parent: div,
            scene: MainScene
        });
    }
    start() {}
    pause() {}
    teardown() {}
    reset() {}
}
