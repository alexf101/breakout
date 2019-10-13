import * as React from "react";
import * as ReactDOM from "react-dom";

import { CanvasGame } from "./components/CanvasGame";
import { PhaserWrapper } from "./components/PhaserWrapper";

ReactDOM.render(
    <div>
        <PhaserWrapper />
        {/* <CanvasGame /> */}
    </div>,
    document.getElementById("react-app")
);
