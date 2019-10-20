import { number } from "prop-types";
import * as Phaser from "phaser";

declare const window: {
    DEBUG: boolean | undefined;
    PHASER: boolean | undefined;
};

class MainScene extends Phaser.Scene {
    ball: Phaser.Physics.Arcade.Sprite;
    paddle: Phaser.Physics.Arcade.Sprite;
    preload() {
        this.game.scale.scaleMode = Phaser.Scale.ScaleModes.ENVELOP;
        this.game.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
        this.cameras.main.setBackgroundColor("#eee");
        this.load.image("ball", "assets/ball.png");
        this.load.image("paddle", "assets/paddle.png");
    }
    create() {
        window.DEBUG = true;
        if (window.DEBUG) {
            showCoords(this);
        }
        this.physics.systems.start(Phaser.Physics.Arcade);
        this.ball = this.physics.add.sprite(180, 250, "ball");
        const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
        ballBody.setVelocity(60, 60);
        ballBody.collideWorldBounds = true;
        ballBody.bounce.set(1);
        this.paddle = this.physics.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.height - 5,
            "paddle"
        );
        const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body;
        paddleBody.collideWorldBounds = true;
        paddleBody.setImmovable();
        this.paddle.setOrigin(0.5, 1);
    }
    update() {
        this.physics.collide(this.ball, this.paddle);
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
            scene: MainScene,
            physics: {
                default: "arcade"
            }
        });
    }
    start() {}
    pause() {}
    teardown() {}
    reset() {}
}

// Debugging graph.
function showCoords(scene: Phaser.Scene) {
    for (let i = 20; i < scene.game.canvas.width; i += 20) {
        const line = scene.add.line(
            0,
            0,
            i,
            20,
            i,
            scene.game.canvas.height,
            0x000000,
            1
        );
        line.setOrigin(0, 0);
        const text = scene.add.text(i, 10, i.toString(), {
            fill: "black",
            fontSize: "8px"
        });
        text.setOrigin(0.5, 0.5);
    }
    for (let j = 0; j < scene.game.canvas.height; j += 20) {
        const line = scene.add.line(
            0,
            0,
            20,
            j,
            scene.game.canvas.width,
            j,
            0x000000,
            1
        );
        line.setOrigin(0, 0);
        const text = scene.add.text(5, j, j.toString(), {
            fill: "black",
            fontSize: "8px"
        });
        text.setOrigin(0, 0.5);
    }
}
