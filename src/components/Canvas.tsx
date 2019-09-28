import * as React from "react";
import styled from "styled-components";

import { Game } from "../classes/Game";

export interface CanvasGameProps {}

const Canvas = styled.canvas`
    // width: 480px;
    // height: 320px;
    background: #eee;
    display: block;
`;
export const CanvasGame = (props: CanvasGameProps) => (
    <Canvas
        width={480}
        height={320}
        ref={canvasEl => new Game(canvasEl.getContext("2d")).start()}
    />
);
