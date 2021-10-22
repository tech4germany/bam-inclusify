import "normalize.css";
import { createGlobalStyle, css, DefaultTheme, GlobalStyleComponent } from "styled-components";
import { Colors } from "./Colors";
import { Fonts } from "./Fonts";

export function makeGlobalStyle(inAddin: boolean): GlobalStyleComponent<{}, DefaultTheme> {
  const bodyBackgroundColor = inAddin ? "transparent" : Colors.backgroundGray;
  const bodyOverflow = inAddin ? "scroll" : "initial";
  const mainFont = Fonts.main;

  // prettier doesn't reformat styles for `createGlobalStyle`, so we put it into a variable with css`` first
  const styles = css`
    body {
      background: ${bodyBackgroundColor};
      font-family: ${mainFont.family}, sans-serif;
      font-size: 16px;
      font-weight: ${mainFont.weights.normal};
      /* overflow-y: ${bodyOverflow}; */
    }

    body,
    #root {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  `;

  return createGlobalStyle`${styles}`;
}
