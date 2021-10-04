import React from "react";
import ReactDOM from "react-dom";
import { GlobalStyle } from "../common/global-styles";
import { StandaloneApp } from "./StandaloneApp";

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <StandaloneApp />
  </React.StrictMode>,
  document.getElementById("root")
);
