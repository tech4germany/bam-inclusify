import "normalize.css";
import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    background: #E8E8E8;
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    font-weight: 300;
  }
`;
