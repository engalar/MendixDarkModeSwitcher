import { createElement } from "react";

import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/DarkModeSwitcher.css";

export function DarkModeSwitcher({ sampleText }) {
    return <HelloWorldSample sampleText={sampleText} />;
}
