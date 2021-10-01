import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import { createGlobalStyle } from "styled-components";
import { StandaloneApp } from "./StandaloneApp";

const GlobalStyle = createGlobalStyle`
  body {
    background: #E8E8E8;
    font-family: sans-serif;
  }
`;

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <StandaloneApp />
  </React.StrictMode>,
  document.getElementById("root")
);
