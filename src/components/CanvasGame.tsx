import * as React from "react";
import styled from "styled-components";

export interface CanvasGameProps {}

const Canvas = styled.canvas`
    width: 100%;
    height: 500px;
    background: blue;
`;
export const CanvasGame = (props: CanvasGameProps) => <Canvas />;
