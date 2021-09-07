import React from "react";
import ReactDOM from "react-dom";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import { ThemeProvider } from "@fluentui/react";
import "../index.css";
import { TaskpaneApp } from "./TaskpaneApp";

initializeIcons();

/* Render application after Office initializes */
Office.initialize = () => {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider>
        <TaskpaneApp />
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
};
