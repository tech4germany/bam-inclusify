import React from "react";
import ReactDOM from "react-dom";
import { makeGlobalStyle } from "../common/global-styles";
import { StandaloneApp } from "./StandaloneApp";

const GlobalStyle = makeGlobalStyle(false);

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <StandaloneApp />
  </React.StrictMode>,
  document.getElementById("root")
);
