import * as assert from "assert";
import { Game, CanvasObject } from "../../src/classes/NativeGame";
import * as ReactDOM from "react-dom";
import { CanvasGame } from "../../src/components/CanvasGame";
import React = require("react");

describe("breakout tests", function() {
    let reactCanvas: CanvasGame;
    let game: Game;

    function assertCloseEnough(obj: CanvasObject, ex: number, ey: number) {
        assert.ok(
            ex - 10 < obj.x && obj.x < ex + 10,
            `${obj.constructor.name}(x): actual position ${obj.x} is not within 10 canvas coordinates of ${ex}`
        );
        assert.ok(
            ey - 10 < obj.y && obj.y < ey + 10,
            `${obj.constructor.name}(y): actual position ${obj.y} is not within 10 canvas coordinates of ${ey}`
        );
    }
    function move50Steps() {
        // Run 50 steps at our normal frame rate.
        // Ball velocity begins at 2 / 10, so this should take us 50 * 10 * 2/10 pixels = 100 pixels.
        for (let i = 0; i < 50; i++) {
            game.step(10);
        }
    }
    beforeEach(function(done) {
        (window as any).DEBUG = true;
        const testDiv = document.createElement("div");
        document.body.appendChild(testDiv);
        ReactDOM.render(
            <div id={this.currentTest.fullTitle()}>
                <h2>{this.currentTest.fullTitle()}</h2>
                <CanvasGame
                    ref={component => {
                        // If mounting, as opposed to unmounting.
                        if (component) {
                            reactCanvas = component;
                            game = reactCanvas.game;
                            // Immediately pause - we'll step through each frame manually.
                            game.pause();
                            done();
                        }
                    }}
                />
            </div>,
            testDiv
        );
    });
    context("when the ball is heading downwards", function() {
        beforeEach(function() {
            game.ball.setPosition(200, 240);
            game.paddle.setPosition(240, game.paddle.y);
            // Ball begins the game heading upwards. Make it go down instead.
            game.ball.motions.linear.bounceY();
            // Clear nothing so we can see the ball's path.
            game.clear = () => null;
        });

        it("bounce from paddle left to right", function() {
            move50Steps();
            assertCloseEnough(game.ball, 300, 260);
            assert.equal(game.score.score, 0); // Check we didn't hit the bottom.
        });
        it("bounce from paddle right to left", function() {
            game.paddle.setPosition(100, game.paddle.y);
            // Ball begins the game heading upwards and rightwards. Make it go downwards and leftwards instead.
            game.ball.motions.linear.bounceX();
            move50Steps();
            assertCloseEnough(game.ball, 100, 260);
            assert.equal(game.score.score, 0); // Check we didn't hit the bottom.
        });
        it("takes 100 points if you hit the bottom", function() {
            // This should miss.
            game.paddle.setPosition(300, game.paddle.y);
            move50Steps();
            assert.equal(game.score.score, -100); // Check we didn't hit the bottom.
        });
    });
});
