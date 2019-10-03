import * as React from "react";
import styled from "styled-components";

import { Game } from "../classes/Game";

export interface CanvasGameProps {}

declare const window: { DEBUG: boolean | undefined };

const Canvas = styled.canvas`
    // width: 480px;
    // height: 320px;
    background: #eee;
    display: block;
`;
export class CanvasGame extends React.Component<CanvasGameProps> {
    game?: Game;
    render() {
        return (
            <div>
                <Canvas
                    width={480}
                    height={320}
                    ref={canvasEl => {
                        if (canvasEl) {
                            this.game = new Game(canvasEl.getContext("2d"));
                            this.game.start();
                        } else {
                            if (this.game) {
                                this.game.pause();
                                this.game.teardown();
                            }
                        }
                    }}
                />
                <button onClick={() => this.game && this.game.pause()}>
                    pause
                </button>
                <button onClick={() => this.game && this.game.start()}>
                    play
                </button>
                <button onClick={() => this.game && this.game.reset()}>
                    restart
                </button>
                <button
                    onClick={() => {
                        window.DEBUG = !window.DEBUG;
                    }}
                >
                    toggle debug mode
                </button>
                <p>Press spacebar to pause and play.</p>
                <p>
                    When debug mode is active, click anywhere in the canvas to
                    position the ball there.
                </p>
                <p>
                    The game will pause if the ball hits the bottom of the
                    screen (eventually this will also cause a loss of a life).
                </p>
            </div>
        );
    }
}
