import React from "react";
import ReactDOM from "react-dom";
import "../index.css";
import App from "../App";

console.warn("This is the standalone entry point");

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
