import React from "react";
import ReactDOM from "react-dom";
import { GlobalStyle } from "../common/global-styles";
import { TaskpaneApp } from "./TaskpaneApp";
import { setOfficeHostInfo } from "../common/office-api-helpers";

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
