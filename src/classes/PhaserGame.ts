import { number } from "prop-types";
import * as Phaser from "phaser";

declare const window: {
    DEBUG: boolean | undefined;
    PHASER: boolean | undefined;
};

class MainScene extends Phaser.Scene {
    ball: Phaser.GameObjects.Sprite;
    preload() {
        this.game.scale.scaleMode = Phaser.Scale.ScaleModes.ENVELOP;
        this.game.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
        this.cameras.main.setBackgroundColor("#eee");
        this.load.image("ball", "assets/ball.png");
    }
    create() {
        this.ball = this.add.sprite(50, 50, "ball");
    }
    update() {
        this.ball.x += 1;
        this.ball.y += 1;
    }
}

window.DEBUG = true;
export class Game {
    game: Phaser.Game;
    constructor(div: HTMLDivElement) {
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
