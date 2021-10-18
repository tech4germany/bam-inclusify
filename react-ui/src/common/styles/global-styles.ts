import "normalize.css";
import { createGlobalStyle, DefaultTheme, GlobalStyleComponent } from "styled-components";
import { Fonts } from "./Fonts";

export function makeGlobalStyle(inAddin: boolean): GlobalStyleComponent<{}, DefaultTheme> {
  const bodyBackgroundColor = inAddin ? "transparent" : "#E8E8E8";
  const bodyOverflow = inAddin ? "scroll" : "initial";
  const mainFont = Fonts.main;

  return createGlobalStyle`
    body {
      background: ${bodyBackgroundColor};
      font-family: ${mainFont.family}, sans-serif;
      font-size: 16px;
      font-weight: ${mainFont.weights.normal};
      overflow-y: ${bodyOverflow};
    }`;
}
