import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "../index.css";
import { StandaloneApp } from "./StandaloneApp";

ReactDOM.render(
  <React.StrictMode>
    <StandaloneApp />
  </React.StrictMode>,
  document.getElementById("root")
);
