import * as React from "react";
import * as ReactDOM from "react-dom";

import { CanvasGame } from "./components/CanvasGame";

if ((window as any).THIS_IS_UNIT_TESTS) {
    console.log("TEST MODE");
} else {
    ReactDOM.render(<CanvasGame />, document.getElementById("react-app"));
}
