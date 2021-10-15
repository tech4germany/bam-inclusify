import "normalize.css";
import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import { createGlobalStyle, DefaultTheme, GlobalStyleComponent } from "styled-components";

export function makeGlobalStyle(inAddin: boolean): GlobalStyleComponent<{}, DefaultTheme> {
  const bodyBackgroundColor = inAddin ? "transparent" : "#E8E8E8";
  const bodyOverflow = inAddin ? "scroll" : "initial";
  return createGlobalStyle`
    body {
      background: ${bodyBackgroundColor};
      font-family: "Roboto", sans-serif;
      font-size: 16px;
      font-weight: 300;
      overflow-y: ${bodyOverflow};
    }`;
}
