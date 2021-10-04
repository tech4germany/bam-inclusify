import React from "react";
import ReactDOM from "react-dom";
import { makeGlobalStyle } from "../common/global-styles";
import { TaskpaneApp } from "./TaskpaneApp";
import { setOfficeHostInfo } from "../common/office-api-helpers";

const GlobalStyle = makeGlobalStyle(true);

/* Initialize office and start rendering application */
Office.onReady().then((info) => {
  setOfficeHostInfo(info);

  ReactDOM.render(
    <React.StrictMode>
      <GlobalStyle />
      <TaskpaneApp />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
